const { AuthModel } = require("../models/AuthModel.js");

async function createUser(userName, userEmail, password) {
  try {
    await AuthModel.create({
      UserName: userName,
      UserEmail: userEmail,
      Password: password,
    });
  } catch (err) {
    throw new Error(err.message);
  }
}

async function userExist(userEmail) {
  try {
    const user = await AuthModel.findOne({ UserEmail: userEmail });
    return user != null;
  } catch (err) {
    throw new Error(err.message);
  }
}
async function addToken(token, userEmail) {
  try {
    const user = await AuthModel.findOne({ UserEmail: userEmail });
    if (!user) {
      throw new Error("User not found");
    }
    await user.updateOne({ $push: { Tokens: token } });
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = { createUser, userExist, addToken };
