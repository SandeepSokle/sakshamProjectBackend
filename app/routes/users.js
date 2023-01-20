var express = require("express");
var router = express.Router();
const users = require("../models/userModel");
const products = require("../models/productsModal");

const jwt = require("jsonwebtoken");
/* GET users listing. */
router.get("/", async function (req, res, next) {
  try {
    const user = await users.find();
    res.send(
      user.map((ele) => {
        return { name: ele.name, email: ele.email, userName: ele.userName };
      })
    );
  } catch (err) {
    res.send(500, err);
  }
});

router.post("/login", async function (req, res, next) {
  console.log(req.body);
  try {
    const user = await users.findOne({ email: req.body.email });
    console.log(user);
    if (!user) {
      throw "User Not Found";
    }
    res.send(200, user);
  } catch (err) {
    res.send(500, err);
  }
});

router.post("/signup", async (req, res, next) => {
  console.log(req.body);
  try {
    const token = jwt.sign(
      {
        name: req.body.name,
        email: req.body.email,
        userName: req.body.userName,
      },
      "sokle"
    );

    console.log(token);

    // user.token = token;

    const user = await users.create({
      ...req.body,
      token,
    });

    user.save();

    res.send(user);
  } catch (err) {
    res.send(500, err);
  }
});

router.post("/purchase", async (req, res, next) => {
  console.log(req.body);
  try {
    const user1 = await users.findOne({ email: req.body.email });
    if (!user1) {
      throw "user Not Found";
    }
    const availableBalance = user1?.balance;
    console.log({ user1, availableBalance, pl: req.body.plants });

    //find is avilable or not
    let errorMes = [];
    let done = [];
    let total = 0;
    let allPlant = req.body.plants;
    for (let i = 0; i < allPlant.length; i++) {
      let pro = await products.findOne({ _id: allPlant[i] });
      if (user1.cartList.find((e) => e == allPlant[i])) {
        //remove from cart
        let newCartList = user1.cartList.filter((e) => e != allPlant[i]);
        let ur = await users.findOneAndUpdate(
          { email: req.body.email },
          {
            cart: newCartList,
            cartList: newCartList,
          }
        );
      }
      if (pro && !pro?.isAvailable) {
        console.log("pro && !pro?.isAvailable", pro.name);
        errorMes.push(pro.name);
        continue;
      }

      if (user1.prodlist.find((e) => e == allPlant[i])) {
        //check if already purchased
        console.log("user1.prodlist.find((e) => e == ele))", pro.name);
        errorMes.push(pro.name);
        continue;
      }

      console.log(total || 0, pro.rate, availableBalance);
      if (total || 0 + pro.rate <= availableBalance) {
        await products.findOneAndUpdate(
          { _id: allPlant[i] },
          {
            isAvailable: false,
          }
        );
        done.push(allPlant[i]);
        total = total + pro.rate;
        continue;
      } else {
        console.log("else", pro.name);

        errorMes.push(pro.name);
        continue;
      }
    }

    console.log({ errorMes, total, done });

    let plants = [...user1.prodlist, ...done];

    // var unique = plants.filter((v, i, a) => {
    //   return a.indexOf(v) === i;
    // });

    const user = await users.findOneAndUpdate(
      { email: req.body.email },
      {
        products: plants,
        prodlist: plants,
        $inc: { balance: -total },
      },
      { new: true }
    );

    // user.save();
    // if (errorMes.length >= 1) {
    //   throw "You can not Purchase : " + errorMes.join(" ");
    // }
    console.log({ user, err: errorMes });
    res.status(200).send({ user, err: errorMes });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/addpoints", async (req, res, next) => {
  console.log(req.body);
  try {
    const user = await users.findOneAndUpdate(
      { email: req.body.email },
      {
        $inc: { balance: req.body.balance },
      },
      { new: true }
    );
    user.save();
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/sendgift", async (req, res, next) => {
  console.log(req.body);
  if (!req.body.productId || !req.body.email || !req.body.toEmail)
    throw "Uncompleted information";
  try {
    const fromUser = await users.findOne({ email: req.body.email });
    let newList = fromUser.prodlist.filter((ele) => ele !== req.body.productId);
    let fromGift = fromUser.gifts.filter((ele) => ele !== req.body.productId);

    let fUser = await users.findOneAndUpdate(
      { email: req.body.email },
      {
        products: newList,
        prodlist: newList,
        gifts: fromGift,
      },
      { new: true }
    );

    const toUser = await users.findOne({ email: req.body.toEmail });
    let toList = [...toUser.prodlist, req.body.productId];
    let toGift = [...toUser.gifts, req.body.productId];

    // console.log({ toUser, toList, toGift });

    let tUser = await users.findOneAndUpdate(
      { email: req.body.toEmail },
      {
        gifts: toGift,
      },
      { new: true }
    );
    console.log({ fUser, tUser });

    res.status(200).send({ fUser, tUser });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/addcart", async (req, res, next) => {
  console.log(req.body);
  try {
    const user1 = await users.findOne({ email: req.body.email });
    let user;
    let pro = await products.findOne({ _id: req.body.product });

    if (pro.isAvailable) {
      let plants = [...user1.cartList, req.body.product];

      var unique = plants.filter((v, i, a) => {
        return a.indexOf(v) === i;
      });

      user = await users.findOneAndUpdate(
        { email: req.body.email },
        {
          cartList: unique,
          cart: unique,
        },
        { new: true }
      );
    } else {
      throw "Tree Not Available";
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.delete("/deleteCart", async (req, res, next) => {
  console.log(req.body);
  try {
    const user1 = await users.findOne({ email: req.body.email });
    let user;
    let pro = await products.findOne({ _id: req.body.product });

    if (pro.isAvailable) {
      let plants = user1.cartList.filter((ele) => ele !== req.body.product);

      user = await users.findOneAndUpdate(
        { email: req.body.email },
        {
          cartList: plants,
          cart: plants,
        },
        { new: true }
      );
    } else {
      throw "Tree Not Available";
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});
module.exports = router;
