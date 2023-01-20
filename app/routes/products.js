var express = require("express");
var router = express.Router();
const products = require("../models/productsModal");

router.get("/", async function (req, res, next) {
  try {
    const product = await products.find();
    // product.map(async (ele) => {
    //   await products.findOneAndUpdate(
    //     { _id: ele._id },
    //     {
    //       isAvailable: true,
    //     }
    //   );
    // });
    res.send(200, { count: product.length, product });
  } catch (err) {
    res.send(500, err);
  }
});

router.post("/add", async (req, res, next) => {
  try {
    const { name, rate } = req.body;
    if (name && rate) {
      const product = await products.create({
        ...req.body,
      });
      res.send(product);
    } else {
      throw "name and rate required";
    }
  } catch (err) {
    res.send(500, err);
  }
});

router.post("/addmulti", async (req, res, next) => {
  console.log(req.body);
  try {
    req.body.data.map(async (ele) => {
      const { name, rate } = ele;
      if (name && rate) {
        const product = await products.create({
          ...ele,
        });
      }
    });
    res.send(200, req.body.data);
  } catch (err) {
    res.send(500, err);
  }
});

module.exports = router;
