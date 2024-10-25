const express = require("express");
const { signup, login, Adduser } = require("../controllers/AuthControllers.js");
const authroutes = express.Router();
authroutes.post("/login", login);
authroutes.post("/signUpValidation", Adduser);
authroutes.post("/signup", signup);
module.exports = { authroutes };
