const {
  createToken,
  verifyToken,
} = require("../middlewares/TokenFunctionalities.js");
const { createUser, userExist, addToken } = require("../repos/AuthRepos.js");
const { generateOtp } = require("../middlewares/GenerateOtp/EmailOtp.js");
async function Adduser(req, res) {
  const { userEmail, userName, pass } = req.body;
  const UserEmailAlreadyExist = await userExist(userEmail);
  if (UserEmailAlreadyExist === true) {
    return res.status(405).json({ status: "User already exists" });
  }
  // Generate OTP and store it in a session variable (or database)
  const emailOtp = generateOtp();
  req.session.emailOtpData = { otp: emailOtp, email: userEmail }; // Example using session storage
  console.log(emailOtp);
  try {
    await verificationMail(userEmail, userName, emailOtp);
    return res.status(200).json({ status: "OTP sent successfully" });
  } catch (e) {
    return res.status(500).json({ status: "Error in sending OTP" });
  }
}

async function signup(req, res) {
  const { userName, userEmail, password, otp } = req.body;
  const storedOtpData = req.session.emailOtpData;
  // Validate required fields
  if (!userName || !userEmail || !password || !otp) {
    return res.status(400).json({
      status: "Error",
      msg: "userName, userEmail , password & otp are required",
    });
  }
  if (
    storedOtpData &&
    otp === storedOtpData.otp &&
    userEmail === storedOtpData.email
  ) {
    try {
      // Check if user already exists
      const checkUser = await userExist(userEmail);
      if (checkUser) {
        return res.status(400).json({
          status: "error",
          msg: "User already exists",
        });
      }

      // Create new user
      await createUser(userName, userEmail, password);

      // Generate token
      const token = createToken(userEmail, password);
      await addToken(token, userEmail);

      return res.status(201).json({
        status: "success",
        msg: "Successfully signed up",
        token: token, // Send token in response
      });
    } catch (err) {
      return res.status(500).json({
        status: "error",
        msg: err.message,
      });
    }
  } else {
    return res.status(401).json({ status: "Wrong OTP" });
  }
}
async function login(req, res) {
  const { userEmail, password } = req.body;

  // Check for missing fields
  if (!userEmail || !password) {
    return res.status(400).json({
      status: "error",
      msg: "userEmail and password are required",
    });
  }

  try {
    // Check if user exists
    const user = await AuthModel.findOne({ UserEmail: userEmail });
    if (!user) {
      return res.status(400).json({
        status: "error",
        msg: "User does not exist",
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        status: "error",
        msg: "Invalid password",
      });
    }

    // Generate token
    const token = createToken(userEmail, password);

    // Store token
    await addToken(token, userEmail);

    return res.status(200).json({
      status: "success",
      msg: "Login successful",
      token: token,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      msg: err.message,
    });
  }
}
module.exports = { signup, login, Adduser };
