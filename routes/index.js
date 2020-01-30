var express = require('express');
var router = express.Router();
const validator = require('express-joi-validation').createValidator({})
const Joi = require('joi');
var db = require('../database/db-connection')

const Schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  age: Joi.number().integer().required(),
  gender: Joi.string().required(),
  dob: Joi.string().required(),
  place: Joi.string().required()
})

router.post('/signup', validator.body(Schema), async (req, res, next) => {
  const isAdmin = await checkForAdmin();
  const userData = req.body;
  if (isAdmin) {
    userData['isAdmin'] = 1;
    userData['role'] = 'Admin';
  } else {
    userData['isAdmin'] = 0;
    userData['role'] = 'Member';
  }
  const result = await createUser(userData)
  console.log(result)
  res.send(result)
})

// adding data into users table
function createUser(userObj) {
  return new Promise((resolve, reject) => {
    const query = `insert into users (name,email,age,role,isAdmin, gender, dob,place)
   values ("${userObj.name}","${userObj.email}", "${userObj.age}", "${userObj.role}", "${userObj.isAdmin}", "${userObj.gender}", "${userObj.dob}", "${userObj.place}")`;
    db.query(query, (err, resdata) => {
      if (!err) {
        const result = addUserRole(userObj);
        resolve(result);
      } else{
        resolve({ status: 'Error', message: err.message })
      }
    })
  })
}

// adding role into userrole table if any error occurs it delete the data into the users table and return error message
function addUserRole(userObj) {
  return new Promise((resolve, reject) => {
    const query = `select * from users where email = "${userObj.email}"`;
    db.query(query, (error, response) => {
      if (!error && response && response.length !== 0) {
        const userData = response[0];
        const query2 = `insert into userroles (role,userid) values ("${userData['ROLE']}", "${userData['id']}")`;
        db.query(query2, (err, result) => {
          if (err) {
            db.query(`delete from users where id = "${userData['id']}"`, (err, data) => {
              resolve({ status: 'Error', message: "Something went wrong" })
            })
          } else {
            resolve({ status: 'Success', message: "User created Successfully" })
          }
        })
      } else {
        resolve({ status: 'Error', message: error.message })
      }
    })
  })
}

// chaecking for the first user if there no data in the users table the the first registered user is an admin;
function checkForAdmin() {
  return new Promise((resolve, reject) => {
    db.query('select count(*) as count from users', (err, responce) => {
      if (err) {
        reject(err)
      }
      const result = responce[0]['count'] === 0 ? true : false;
      resolve(result);
    })
  })
}
module.exports = router;
