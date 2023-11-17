require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Users } = require("../models");
const { Op } = require('sequelize');
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middlewares/auth-middleware");

// 회원가입 API
router.post('/join', async (req, res) => {
  try {
    const { email, password, passwordChk, name } = req.body;

    if (!email || !password || !passwordChk || !name) {
      res.status(400).json({
        message: "정보를 전부 입력해주세요."
      });
      return;
    }

    // 이메일 형식을 검사하는 정규표현식
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const validateEmail = (email) => {
      return emailRegex.test(email);
    };

    // 이메일 형식 유효성 검사
    if (!validateEmail(email)) {
      res.status(400).json({
        message: "이메일 형식이 맞지 않습니다."
      })
      return;
    }

    // 이메일, 이름 중복 유효성 검사
    const existUser = await Users.findOne({
      where: {
        [Op.or]: [{ email }, { name }]
      }
    });
    if (existUser) {
      res.status(400).json({
        message: "이메일이나 이름이 이미 사용중입니다."
      })
      return;
    }

    // 비밀번호 유효성 검사
    if (password.length < 6) {
      res.status(400).json({
        message: "비밀번호는 최소 6자 이상 입력해주세요."
      })
      return;
    }
    if (password !== passwordChk) {
      res.status(400).json({
        message: "비밀번호가 일치하지 않습니다."
      });
      return;
    }

    const user = new Users({ name, email, password });
    await user.save();

    res.status(201).json({
      message: "회원가입에 성공했습니다!",
      data: user
    });
  } catch (error) {
    res.status(500).json({ message: "예기치 못한 에러가 발생하였습니다." });
  }
});

// 로그인 API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({
      where: { email }
    });

    // 해쉬한 비밀번호 풀어서 비교해주기
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "이메일 또는 비밀번호가 일치하지 않습니다." });
    }

    const accessToken = jwt.sign(
      { userId: user.userId },
      process.env.SECRET_KEY,
      { expiresIn: '1m' }
    )

    // res.send({ accessToken });
    res.cookie("authorization", `Bearer ${accessToken}`);
    return res.status(200).json({ message: "로그인 되었습니다." });
  } catch (error) {
    res.status(500).json({ message: "예기치 못한 에러가 발생하였습니다." });
  }
})

// 내 정보 조회 API
router.get("/users/me", authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const userInfo = await Users.findOne({
      where: { userId },
      attributes: { exclude: ['password'] }
    })
    // const { password, updatedAt, ...userInfo } = res.locals.user
    // console.log(userInfo);
    return res.status(200).json({ userInfo });
  } catch (error) {
    res.status(500).json({ message: "예기치 못한 에러가 발생하였습니다." });
  }
});

module.exports = router;