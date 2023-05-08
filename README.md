# Onephoto Node

This project uses a [Node.js](https://nodejs.org/en/about/) server script that uses a persistent [SQLite](https://www.sqlite.org) database. The app also includes a front-end with two web pages that connect to the database using the server API. 📊 

As my final project for the course _COMP360:Information Security and Privacy_, I focused on the authentication and authorization aspect of building websites. 

There are three pages `/register`, `/login`, `/welcome`. Users can register new users in `/register` and login using their credentials in the `/login` page. Once a user has been authenticated, they are redirected to the `/welcome` page where they can access the mystery 'onephoto'. 

The authentication and authorization processes utilize a variety of [npm](https://www.npmjs.com) packages including [jsonwebtokens](https://jwt.io) and [bcrypt](https://www.npmjs.com/package/bcrypt).

The purpose of this readme file is to guide anyone who is interested in learning how to implement basic web applications that run on node.js server script.

📆 _Last Updated: May 7, 2023_ 

## Prerequisite

- Some knowledge on javascript, html will be helpful for following along.
- A version of node (can be installed using `brew install node`. For instructions on how to install brew or other operating systems, refer to [how to install node](https://nodejs.dev/en/learn/how-to-install-nodejs/)).

## What's in this project?

← `README.md`: That’s this file

← `package.json`: The NPM packages for this project's dependencies.

← `.env`: Where environment variables are saved. In the case of this project, where the private key for jsonwebtokens is saved.

### Server and database

← `./src/data.json`: Reads the `database` property to import the correct script.

← `./src/sqlite.js`: This is how the application handles raw sqlite query commands.

When the app runs, the script creates the database :

← `.data/userdatabase.db`: This is the sqlite database where user credentials such as username and password are saved.

### Request handling and User Interface

← `views/register.js`: Handles request and responses on '/register'. Interacts with `sqlite.js` to handle new user registration.

← `views/login.js`: Handles request and responses on '/login'. Imports `User` object from `User.js` to handle validation and authentication.

← `views/welcome.js`: Handles request and responses on '/welcome'. `auth.js` is used to authorize web tokens.

← `views/logout.js`: Handles logout request from '/welcome'. Simply destroys cookies and redirect users to '/register'

### Authentication and authorization + validation

← `src/validation.js`: Includes validation formats for input validation. Is called in `register.js` and `login.js`.

← `middleware/auth.js`: Includes the middleware used to authorize and validate web tokens.

← `src/user.js`: Includes class `User` which takes two constructors 'username' and 'password'. Two functions called authenticate and genToken communicates with `sqlite.js` to authenticate user credentials and generate token using the private key from .env.

## Step-by-step

A step-by-step explanation of how this project was built.

### Setting up index.js

The `index.js` file is the center of our application. First, we import all required packages:

- `express`: HTTP protocal library
- `express-handlebars`: An express version of Handlebars
- `cookie-parser`: Parses cookie values for express

Express allows the use of middleware. The codes in the `/views` folder are basically treated as middleware. Middlewares can be simplified as chains of functions that the HTTP request goes through. We register middleware functions using the `use()` syntax. 

Next, we define a port number the app will listen to. 

```Javascript
const PORT = process.env.PORT || 3000 ;
```

`process.env` is where environment variables are stored. In the code, we also import `dotenv` to handle a custom `.env` file and load variables we want to hide from end-point users.

### Validation rules

The validation rules are contained in the `validation.js` file.

Validation is implemented using the `Joi` package. 

We call `Joi.object()` to create a new `schema` that includes the validation rules. 

To define a new rule, we call `Joi.` followed by a rule type of our choice, which in this case is `string()`. We can add extra rules such as `min()`, `max()` by chaining rules like so : `Joi.string().min(5)`. 

In this application we will include custom error messages in `messages({})` to be used later to display error messages in our HTML page.

Another point to note is the password regex pattern.

```javascript
const passwordPattern = new RegExp('^[a-zA-Z0-9!@]{3,25}$');
```

`Joi` allows custom regex patterns for input validation, and declaring a passwordPattern like this makes it easier to maintain in case there is a need to change the password pattern.

To validate an input, we call 
```javascript
schema.validate(input)
```
Since we want to be able use this function from outside of this file, we export the functions as such.

```javascript
module.exports = {
    validateRegister: (request) => registerSchema.validate(request),
    validateLogin: (request) => loginSchema.validate(request)
};
```

### Setting up views

As an example, we will look at `register.js`. In this case, we instantiate a `router` object using `express.Router()`. This is so that we can send the `router` object to `exports.module`. Express does not allow an `app` object to be deployed as part of a 'middle' object.

```Javascript
router.get('/', (req, res) => {})
router.post('/', (req, res) => {})
```

Handles GET requests and POST requests respectively.

In our GET block, we use

```javascript
res.render('register', {registerErrorMsg})
```

which finds `register.handlebars` and renders the page using the variables fed through `registerErrorMsg` object.

We imported the `validation.js` file through `require('../src/validation')` and assigned it to `validation`.

When the user sends a request form, we validate the form body using

```javascript
const { error, value } = validation.validateRegister(_.pick(req.body, ['username', 'password', 'confirm_password']));
```

You can see that the function returns two values; error and value. If the input body fields are successfully validated, the error value is returned as `undefined`. However, if `Joi` fails to validate the input, it will return an error, which in this case also contains our error message we wrote in `validation.js`.

We will assign the error message to the appropriate errmsg value using a case matching statement.

```javascript
switch (error.details[0].context.key) {
            case 'username' : 
                resetErrorMessages();
                registerErrorMsg.username_err = error.message;
                break;
            case 'password' :
                resetErrorMessages();
                registerErrorMsg.password_err = error.message;
                break;
            case 'confirm_password' :
                resetErrorMessages();
                registerErrorMsg.confirm_password_err = error.message;
                break;
}
```

We then clear the original error messages and render the page. This time, sending the input fields so that when it re-renders, the user input is persistent.

```javascript
res.render('register', {
            registerErrorMsg,
            username : req.body.username,
            password : req.body.password,
            confirm_password : req.body.confirm_password
        });
```

If `Joi` does not return an error - meaning input validation was sucessful - we will pick the username and password from our `value` returned by calling the `validateRegister` and push those values as a user in our database.

```javascript
try {
    await db.createUser(req_username, req_password);
} catch (dbError) {
    res.status(501);
}   
```

### SQLITE functions

The app uses `sqlite3` as our driver and `sqlite` as our wrapper. When the application is run, it will automatically create a `userdatabase.db` file if there isn't one already.

We will write two functions `createUser` and `getUser`.

Both functions will utilize prepared functions to add another protection layer against SQL injections. Here, `bcrypt` is used to hash the password value and store the hashed value in our database instead of the raw password value. `bcrypt` handles salting automatically and simplifies the hashing and comparing process by providing `bcrypt.hash` and `bcrypt.compare`.

```javascript
bcrypt.hash(req_password, saltRounds, async function(err, hash) {})
```

The compare side of code is encapsulated in the `User` class discussed in the _Authentication and Authorization_ section.

### Setting up handlebar html pages

The HTML elements were copied from the php code in the original assignment. However, since node renders front-end code differently, we need to implement a way to display html code. [React](https://react.dev) is a popular front-end library used in combination with nodejs, but for our application, we will try to keep it simple and utilize [handlebars](https://www.npmjs.com/package/handlebars).

Handlebars is a simple way to display dynamic values to a HTML page. The process is fairly straightforward; anywhere you want a variable rendered, the variable is encapsulated between brackets like so. `{{_var_}}`

In comparison to the original PHP code,

```PHP
<div class="form-group <?php echo (!empty($username_err)) ? 'has-error' : ''; ?>">
```
We have this is Handlebars
```Handlebars
<div class="form-group {{#if registerErrorMsg.username_err}}has-error{{else}}{{/if}}">
```
The `{{#if}} {{/if}}` block is a built in helper function in Handlebars.

Looking back to our back-end code, whenever we render a page, we pass our variables values like so.

```javascript
res.render('register', {registerErrorMsg})
```

So if, registerErrorMsg is not empty, the html page will be rendered as:
```javascript
<div class="form-group has-error">
```

### Authentication and Authorization

This app uses jsonwebtokens to handle user authentication. Authentication and authorization is handled in `user.js`. The code contains two functions `authenticate` and `genToken`. Discussed in the earlier section _SQLITE functions_, the `authenticate` function uses `bcrypt.compare` to check password matching.

```javascript
bcrypt.compare(this.password, _.get(userdata, 'PASSWORD'), function (err, result) {
    callback(err, result);
})
```

In this case, we want to pass the result of authenticating the user to `login.js` so we use a callback function that can be written in `login.js` to handle how to process the results.

The genToken function signs a token using the private key stored in `.env`. the token payload contains the username and id fields queried from the database.

```javascript
jwt.sign(_.pick(userdata, ['USERNAME', 'id']), process.env.JWT_KEY, {expiresIn : token_exp});
```

We defined `token_exp` as a separate value for easier maintenance.

`login.js` imports this class `User` and instantiates a new `User` using the request body fields.

```javascript
const new_user = new user(_.get(value,'username'), _.get(value,'password'));
```

Next, we call the `authenticate` function and if the user is authenticated, we create a token and save it as a cookie object.

```javascript
new_user.authenticate( async (err, result) => {
    if (result) {
        const token = await new_user.genToken();
        res.cookie('token',token, { httpOnly: true, maxAge: 3600000 });
        res.redirect('/welcome');
    }
    else res.status(401);
});
```

**It is not ideal to store token value in a cookie header, but for the scope of this project, this will do**

We will then create a middleware function `auth()` that will be called before processing a request to `welcome.js`. 

```javascript
if (!token) return res.status(401).send('access denied. No token provided');
```

First, we check for a token using `req.cookies.token`. If no token is provided, we will throw a 401 http status.

```javascript
const decoded = jwt.verify(token, process.env.JWT_KEY);
req.user = decoded;
next();
```

Next, we verify the token using `jwt.verify` which will try to decrypt the payload using our private key. If the decryption is successful, we will save the payload in a user field and pass the request to the next process. which is `welcome.js` in this case. If the token authorization fails, we will send a 400 http status.

We don't want this authorization middleware to be used for every single request in our app. For example, we don't want to check for a token when users are trying to access '/register' page. So in our `welcome.js` code, we include the `auth` function to our get request like so.

```javascript
router.get('/', auth, (req, res) => {
    res.render('welcome', {message : `You are logged in as user: ${_.get(req.user, 'USERNAME')}`});
})
```

This will then send the GET request through the auth middleware before it can reach '/welcome'. Any unauthorized requests will be filtered by the auth middleware and protect our route to '/welcome'.