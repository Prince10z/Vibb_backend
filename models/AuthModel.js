const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const AuthSchema = new mongoose.Schema(
  {
    UserName: {
      type: String,
      requried: true,
      minlength: 3,
    },
    UserEmail: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: "Email address is required",
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    Password: {
      type: String,
      trim: true,
      minlength: 6,
    },
    Tokens: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);
AuthSchema.pre("save", async function (next) {
  const user = this;

  // Hash the password only if it has been modified or is new
  if (!user.isModified("Password")) return next();

  try {
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    user.Password = await bcrypt.hash(user.Password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
AuthSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.Password);
};
const AuthModel = mongoose.model("AuthData", AuthSchema);
module.exports = { AuthModel };
