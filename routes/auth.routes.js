const db = require("../db");

const router = require("express").Router();

const brcypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/signup", async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all fields", success: false });
    }

    const userToFind = await db.user.findFirst({
      where: {
        email,
      },
    });

    if (userToFind) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    const hashedPassword = await brcypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    delete newUser.password;

    res.json({ data: { ...newUser }, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide all necessary fields",
        success: false,
      });
    }

    const userToFind = await db.user.findFirst({
      where: {
        email,
      },
    });

    if (!userToFind) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }

    const isPasswordValid = await brcypt.compare(password, userToFind.password);

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Invalid password", success: false });
    }

    delete userToFind.password;

    const payload = {
      id: userToFind.id,
      email: userToFind.email,
    };

    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET);

    res.status(200).json({ data: { ...userToFind, authToken }, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});

module.exports = router;
