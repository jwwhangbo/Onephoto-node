const Joi = require('joi');

const passwordPattern = new RegExp('^[a-zA-Z0-9!@]{3,25}$');

var registerSchema = Joi.object({
    username : Joi.string().alphanum().min(5).max(30).required().trim().messages({
        'string.base': `username should be a type of 'text'`,
        'string.alphanum' : `username should be alphanumerical value(0-9, a-z)`,
        'string.empty': `username cannot be an empty field`,
        'string.min': `username should have a minimum length of {#limit}`,
        'string.max' : `username cannot be longer than {#limit} characters`,
        'any.required': `username is a required field`
    }),
    password : Joi.string().regex(passwordPattern).min(5).required().trim().messages({
        'string.base' : `password should be a type of text`,
        'string.pattern.base' : `password can be a combination of alphanumerical value(0-9, a-z) and special characters(!@)`,
        'string.empty': `password cannot be an empty field`,
        'string.min': `password should have a minimum length of {#limit}`,
        'any.required': `password is a required field`
    }),
    confirm_password : Joi.any().valid(Joi.ref('password')).required().messages({'any.only' : 'passwords must match'})
});

var loginSchema = Joi.object({
    username : Joi.string().alphanum().required().trim().messages({
        'string.base': `username should be a type of 'text'`,
        'string.alphanum' : `username should be alphanumerical value(0-9, a-z)`,
        'string.empty': `username cannot be an empty field`,
        'any.required': `username is a required field`
    }),
    password : Joi.string().regex(passwordPattern).required().trim().messages({
        'string.base' : `password should be a type of text`,
        'string.pattern.base' : `password can be a combination of alphanumerical value(0-9, a-z) and special characters(!@)`,
        'string.empty': `password cannot be an empty field`,
        'any.required': `password is a required field`
    })
})

module.exports = {
    validateRegister: (request) => registerSchema.validate(request),
    validateLogin: (request) => loginSchema.validate(request)
};