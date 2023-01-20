const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  rate: { type: Number, required: true },
  isAvailable: { type: Boolean, required: false, default: true },
});

module.exports = mongoose.model("products", productSchema);
