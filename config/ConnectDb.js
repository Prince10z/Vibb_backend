const mongoose = require("mongoose");
async function ConnectDb(url) {
  return mongoose
    .connect(url)
    .then((data) => console.log("Connected to database..."))
    .catch((err) => {
      console.log(`Error in connecting database: ${err}`);
      throw new Error(`Error in connecting database: ${err}`);
    });
}
module.exports = { ConnectDb };
