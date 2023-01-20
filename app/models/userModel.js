const mongoose = require("mongoose");
const products = require("./productsModal");
const _ = require("underscore");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  userName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  token: { type: String, required: true },
  balance: { type: Number, required: true },
  phone: { type: Number, required: false, unique: true },
  password: { type: String, required: false },
  gifts: { type: [String], required: false, default: [] },
  prodlist: { type: [String], required: false, default: [] },
  products: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: products,
    default: [],
  },
  cartList: { type: [String], required: false, default: [] },
  cart: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: products,
    default: [],
  },
});

userSchema.pre("save", function (next) {
  this.products = _.uniq(this.products);
  next();
});

module.exports = mongoose.model("users", userSchema);
