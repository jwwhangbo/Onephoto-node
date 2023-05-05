const fs = require("fs");

// Initialize the database
const dbFile = "./.data/userdatabase.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
const bcrypt = require('bcrypt');
const saltRounds = 10;

let db;

dbWrapper
  .open({
    filename: dbFile,
    driver: sqlite3.Database
  })
  .then(async dBase => {
    db = dBase;

    // We use try and catch blocks throughout to handle any database errors
    try {
      if (!exists) {
        // Database doesn't exist yet - create users table
        await db.exec(
          "CREATE TABLE USERS_TABLE (id INTEGER PRIMARY KEY AUTOINCREMENT, USERNAME VARCHAR(10), PASSWORD VARCHAR(255))"
        );
      } 
      else {
        // We have a database already
      }
    } catch (dbError) {
      console.error(dbError);
    }
  });

module.exports = {

  createUser : async (req_username, req_password) => {
    const stmt = await db.prepare('INSERT INTO USERS_TABLE (username, password) VALUES (?, ?)');
    try {
      bcrypt.hash(req_password, saltRounds, async function(err, hash) {
        if (err) {return err;}
        await stmt.bind({1 : req_username, 2 : hash});
        return await stmt.run();
      })
    } catch (dbError) {
      console.error(dbError);
      return dbError;
    }
  },

  getUser : async req_username => {
    const stmt = await db.prepare('SELECT * FROM USERS_TABLE WHERE USERNAME = ?');
    try {
      await stmt.bind({1 : req_username});
      return await stmt.get();
    } catch (dbError) {
      console.error(dbError);
      return dbError;
    }
  }
}