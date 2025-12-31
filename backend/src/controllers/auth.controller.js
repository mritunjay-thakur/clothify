import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateAvatar = (email) => {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`;
};

const setJwtCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

async function signup(req, res) {
  const { email, password, fullName } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const user = await User.create({
      email: email.toLowerCase(),
      fullName: fullName.trim(),
      password,
      profilePic: generateAvatar(email),
      isVerified: true,
    });

    const token = generateToken(user._id);
    setJwtCookie(res, token);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);
    setJwtCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

function logout(req, res) {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("jwt", {
    path: "/",
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}

async function editProfile(req, res) {
  try {
    const { _id: userId } = req.user || {};

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { newName, newEmail, newPassword, deleteAccount } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (deleteAccount) {
      await user.deleteOne();

      const isProduction = process.env.NODE_ENV === "production";
      res.clearCookie("jwt", {
        path: "/",
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
      });

      return res.status(200).json({
        success: true,
        message: "Account deleted successfully",
      });
    }

    if (newEmail && newEmail !== user.email) {
      const existingUser = await User.findOne({
        email: newEmail.toLowerCase(),
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }

      if (!validateEmail(newEmail)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }

      user.email = newEmail.toLowerCase();
      user.profilePic = generateAvatar(newEmail);
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }
      user.password = newPassword;
    }

    if (newName) {
      user.fullName = newName.trim();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error("Edit profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function googleCallback(req, res) {
  try {
    if (!req.user || !req.user._id) {
      throw new Error("No user data received from Google");
    }

    const token = generateToken(req.user._id);
    const isProduction = process.env.NODE_ENV === "production";

    setJwtCookie(res, token);
    console.log(`Google authentication successful for: ${req.user.email}`);

    res.redirect(`${frontendUrl}/clothify?auth=success&source=google`);
  } catch (error) {
    console.error("Google OAuth error:", error);
    const errorMessage = encodeURIComponent(
      error.message || "Authentication failed"
    );

    res.redirect(`${frontendUrl}/login?error=true&message=${errorMessage}`);
  }
}

async function resetPassword(req, res) {
  const { userId, newPassword } = req.body;

  try {
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function getCurrentUser(req, res) {
  try {
    const { _id: userId } = req.user || {};

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId).select("-password -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        profilePic: user.profilePic,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

function checkAuth(req, res) {
  if (req.user) {
    res.status(200).json({
      success: true,
      isAuthenticated: true,
      user: {
        _id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        profilePic: req.user.profilePic,
      },
    });
  } else {
    res.status(200).json({
      success: true,
      isAuthenticated: false,
    });
  }
}

export {
  signup,
  login,
  logout,
  editProfile,
  googleCallback,
  resetPassword,
  getCurrentUser,
  checkAuth,
};
