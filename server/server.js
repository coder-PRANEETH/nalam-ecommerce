require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { User, Product } = require("./schema");
serverurl = "mongodb://localhost:27017/test";

const app = express();
const PORT = process.env.PORT || 4000 ;
const MONGO_URL = process.env.MONGO_URL ;
const JWT_SECRET = process.env.JWT_SECRET || "nalam_jwt_secret";

// ─── Email Configuration (Gmail SMTP) ──────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.log("Email service error (not critical for dev):", error.message);
  } else {
    console.log("Email service ready");
  }
});

// ─── Email Utility Function ─────────────────────────────────────────────────
async function sendOTPEmail(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Nalam Password Reset Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hi,</p>
        <p>Your password reset OTP is:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #4f8ef7; letter-spacing: 10px; margin: 0;">${otp}</h1>
        </div>
        <p><strong>This code will expire in 5 minutes.</strong></p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">© 2026 Nalam E-commerce. All rights reserved.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
}

app.use(cors());
app.use(express.json());

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = auth.slice(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ─── POST /auth/register ─────────────────────────────────────────────────────
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, phone, address });
    const saved = await user.save();

    const token = jwt.sign(
      { id: saved._id, email: saved.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userData } = saved.toObject();
    res.status(201).json({ token, user: userData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ─── POST /auth/login ────────────────────────────────────────────────────────
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userData } = user.toObject();
    res.json({ token, user: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── POST /auth/forgot-password/send-otp ──────────────────────────────────
app.post("/auth/forgot-password/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists (security best practice)
      return res.status(200).json({ message: "If email exists, OTP will be sent" });
    }

    // Generate 4-digit OTP
    const otp = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

    // Set OTP expiry to 5 minutes from now
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Store OTP in database
    user.resetOTP = otp;
    user.resetOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(user.email, otp);
    } catch (emailError) {
      console.error("Email send error:", emailError);
      // Still return success so user doesn't know email failed
      return res.status(200).json({ message: "If email exists, OTP will be sent" });
    }

    res.status(200).json({ message: "OTP sent to your email. Check inbox." });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// ─── POST /auth/forgot-password/verify-otp ────────────────────────────────
app.post("/auth/forgot-password/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // Find user with reset OTP field selected
    const user = await User.findOne({ email: email.toLowerCase() }).select("+resetOTP +resetOTPExpiry");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or OTP" });
    }

    // Check if OTP matches
    if (user.resetOTP !== otp) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    // Check if OTP is still valid
    if (new Date() > user.resetOTPExpiry) {
      return res.status(401).json({ error: "OTP has expired" });
    }

    // Clear OTP after verification
    user.resetOTP = null;
    user.resetOTPExpiry = null;

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Store hashed token with 1-hour expiry
    user.resetToken = tokenHash;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    res.status(200).json({
      message: "OTP verified successfully",
      resetToken: resetToken  // Send unhashed token to frontend
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// ─── POST /auth/forgot-password/reset-password ────────────────────────────
app.post("/auth/forgot-password/reset-password", async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ error: "Email, reset token, and new password are required" });
    }

    // Validate password length
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // Find user with reset token field selected
    const user = await User.findOne({ email: email.toLowerCase() }).select("+resetToken +resetTokenExpiry");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or reset token" });
    }

    // Hash the provided token to compare
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Verify reset token matches
    if (user.resetToken !== tokenHash) {
      return res.status(401).json({ error: "Invalid or expired reset token" });
    }

    // Check if token is still valid
    if (new Date() > user.resetTokenExpiry) {
      return res.status(401).json({ error: "Reset token has expired" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. Please log in with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// ─── GET /user (protected) ───────────────────────────────────────────────────
app.get("/user", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── PUT /user (protected) ────────────────────────────────────────────────────
app.put("/user", authenticate, async (req, res) => {
  try {
    const { name, phone, addresses, payment, cart } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (addresses !== undefined) updateFields.addresses = addresses;
    if (payment !== undefined) updateFields.payment = payment;
    if (cart !== undefined) updateFields.cart = cart;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ─── GET /products ───────────────────────────────────────────────────────────
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── PUT /orders/:id (protected) ────────────────────────────────────────────
app.put("/orders/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const setFields = {};
    for (const key of Object.keys(updatedData)) {
      setFields[`orders.$[order].${key}`] = updatedData[key];
    }

    const user = await User.findOneAndUpdate(
      { "orders._id": id },
      { $set: setFields },
      { arrayFilters: [{ "order._id": id }], new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "Order not found" });
    }

    const updatedOrder = user.orders.id(id);
    res.json({ message: "Order updated successfully", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── PUT /user/cart (protected) ─────────────────────────────────────────────
app.put("/user/cart", authenticate, async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId ) {
    return res.status(400).json({ error: "productId and quantity (>=1) are required" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const cartItem = user.cart.find(item => item.product.toString() === productId);

    if (cartItem) {
      cartItem.quantity = quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    const updated = await user.save();
    res.json({ message: "Cart updated successfully", cart: updated.cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── DELETE /user (protected) ──────────────────────────────────────────────────
app.delete("/user", authenticate, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────
mongoose.connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

