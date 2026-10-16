const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { safeUser, normalizeCategory, CATEGORIES } = require("../utils/constants");
const { authResponse, signToken } = require("../utils/token");
const { sendPasswordResetEmail } = require("../services/emailService");
function parseLocation(body) {
  const lat = Number(body.latitude);
  const lng = Number(body.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { type: "Point", coordinates: [lng, lat] };
  }
  return undefined;
}

function parseSkills(skills) {
  if (Array.isArray(skills)) return skills.map((s) => normalizeCategory(s)).filter(Boolean);
  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((s) => normalizeCategory(s))
      .filter(Boolean);
  }
  return [];
}

async function register(req, res, next) {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: await bcrypt.hash(password, 10),
      phone,
      address,
      location: parseLocation(req.body),
      role: "user",
    });

    res.status(201).json(authResponse(user, "Account created successfully"));
  } catch (error) {
    next(error);
  }
}

async function registerWorker(req, res, next) {
  try {
    const { name, email, password, phone, address, category, serviceArea } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const skills = parseSkills(req.body.skills);
    const primary = normalizeCategory(category || skills[0] || "");
    if (!primary || !CATEGORIES.includes(primary)) {
      return res.status(400).json({
        message: `Worker category is required. Use one of: ${CATEGORIES.join(", ")}`,
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const uniqueSkills = [...new Set([primary, ...skills])];
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: await bcrypt.hash(password, 10),
      phone,
      address,
      serviceArea: serviceArea || address,
      category: primary,
      skills: uniqueSkills,
      location: parseLocation(req.body),
      role: "worker",
      isApproved: true,
    });

    res.status(201).json(authResponse(user, "Worker account created successfully"));
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json(authResponse(user, "Login successful"));
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);
    res.json({ user: safeUser(user) });
  } catch (error) {
    next(error);
  }
}

async function logout(_req, res) {
  res.json({ message: "Logged out" });
}

async function updateProfile(req, res, next) {
  try {
    const allowed = ["name", "phone", "address", "serviceArea", "profileImage"];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const location = parseLocation(req.body);
    if (location) updates.location = location;

    if (req.user.role === "worker") {
      if (req.body.category) updates.category = normalizeCategory(req.body.category);
      if (req.body.skills) updates.skills = parseSkills(req.body.skills);
    }

    const user = await User.findByIdAndUpdate(req.user.userId, updates, {
      returnDocument: "after",
      runValidators: true,
    });
    res.json({ message: "Profile updated", user: safeUser(user) });
  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user.password) {
      return res.status(400).json({ message: "This account uses Google sign-in" });
    }
    const match = await bcrypt.compare(currentPassword || "", user.password);
    if (!match) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated" });
  } catch (error) {
    next(error);
  }
}


const forgotPassword = async (req, res) => {
    let user;

    try {
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                message: "Please enter your email address.",
            });
        }

        user = await User.findOne({ email });

        // Do not send email to unregistered accounts.
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "This email is not registered with FixFlow.",
            });
        }

        // Generate a secure reset token.
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Save only its hash in MongoDB.
        user.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

        await user.save();

        const clientUrl = process.env.CLIENT_URL;

        if (!clientUrl) {
            throw new Error("CLIENT_URL is missing from .env");
        }

        const resetUrl =
            `${clientUrl}/reset-password/${resetToken}`;

        // Wait for the email service to finish before returning success.
        await sendPasswordResetEmail(user.email, resetUrl);

        return res.status(200).json({
            success: true,
            message: "Password reset link has been sent to your registered email.",
        });
    } catch (error) {
        console.error("Forgot password error:", error.message);

        // Invalidate the token if email delivery or configuration fails.
        if (user) {
            try {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                await user.save();
            } catch (cleanupError) {
                console.error("Token cleanup failed:", cleanupError.message);
            }
        }

        return res.status(500).json({
            success: false,
            message: "Unable to send the reset email. Please try again later.",
        });
    }
};


async function resetPassword(req, res, next) {
  try {
    const token = req.params.token || req.body.token;
const { password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }
    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Reset token is invalid or expired" });
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: "Password has been reset" });
  } catch (error) {
    next(error);
  }
}

async function googleCallback(req, res) {
  try {
    const token = signToken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/google-success?token=${token}`);
  } catch (error) {
    console.log(error);
    res.redirect(`${process.env.CLIENT_URL}/?error=google-login-failed`);
  }
}

module.exports = {
  register,
  registerWorker,
  login,
  me,
  logout,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  googleCallback,
};
