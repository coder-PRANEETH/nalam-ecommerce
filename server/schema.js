const mongoose = require("mongoose");



const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  category: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true,
    minlength: 20
  },

  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },

  discountedPrice: {
    type: Number,
    required: true,
    min: 0
  },

  // ✅ New Cover Image Field
  coverImage: {
    type: String,   // store relative path like "/images/cashew.jpg"
    required: true
  },

  // Optional: Multiple product images
  images: [{
    type: String
  }],

  stockLeft: {
    type: Number,
    required: true,
    min: 0
  }

}, { timestamps: true });



// -----------------------------
// UPI SUBDOCUMENT
// -----------------------------
const upiSchema = new mongoose.Schema({
  label: {
    type: String,
    enum: ["Personal", "Business", "Other"],
    default: "Personal"
  },
  upiId: {
    type: String,
    required: true,
    match: /^[\w.-]+@[\w.-]+$/   // basic UPI format validation
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});


// -----------------------------
// ADDRESS SUBDOCUMENT
// -----------------------------
const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    enum: ["Home", "Work", "Other"],
    required: true
  },
  street: {
    type: String,
    required: false
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});


// -----------------------------
// CART SUBDOCUMENT
// -----------------------------
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});


// -----------------------------
// ORDER SUBDOCUMENT
// -----------------------------
const orderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
    default: "Pending"
  },
  orderedAt: {
    type: Date,
    default: Date.now
  }
});


// -----------------------------
// USER SCHEMA
// -----------------------------
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  phone: String,

  addresses: [addressSchema],   // ✅ Address Array
  cart: [cartItemSchema],
  orders: [orderSchema],
  payment: {
    upiIds: [upiSchema]   // ✅ Array of UPI IDs
  },

  // Password Reset Fields
  resetOTP: {
    type: String,
    select: false,
    default: null
  },
  resetOTPExpiry: {
    type: Date,
    select: false,
    default: null
  },
  resetToken: {
    type: String,
    select: false,
    default: null
  },
  resetTokenExpiry: {
    type: Date,
    select: false,
    default: null
  }

}, { timestamps: true });







module.exports = {
  Product: mongoose.model("Product", productSchema),
  User: mongoose.model("User", userSchema),
};
