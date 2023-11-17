require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Posts, Users } = require("../models");
const { Op } = require('sequelize');
const authMiddleware = require("../middlewares/auth-middleware");

// 상품 목록 조회
router.get("/posts", async (req, res) => {
  try {
    const posts = await Posts.findAll({
      attributes: ["postId", "title", "content", "state", "createdAt"],
      include: [{
        model: Users,
        attributes: ['name'],
      }],
      order: [["createdAt", "DESC"]],
    });

    console.log(posts);
    return res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: "예기치 못한 에러가 발생하였습니다." });
  }
});

// 상품 목록 상세 조회
router.get("/detail", async (req, res) => {
  try {
    const { postId } = req.query;
    const postDatail = await Posts.findOne({
      where: { postId },
      include: [{
        model: Users,
        attributes: ['name'],
      }],
    });

    if (!postDatail) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }

    return res.status(200).json({ postDatail });
  } catch (error) {
    res.status(500).json({ message: "예기치 못한 에러가 발생하였습니다." });
  }
});

// 상품 생성
router.post("/posts", authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { title, content } = req.body;

    const post = await new Posts({
      UserId: userId,
      title,
      content
    })
    await post.save();

    return res.status(201).json({ data: post });
  } catch (error) {
    res.status(500).json({ message: "예기치 못한 에러가 발생하였습니다." });
  }
})

// 상품 수정
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const { userId } = res.locals.user;
    const { title, content, state } = req.body;

    const post = await Posts.findOne({ where: { postId } });

    if (!post) {
      return res.status(404).json({ message: "상품이 존재하지 않습니다." });
    }
    if (post.UserId !== userId) {
      return res.status(401).json({ message: "권한이 없습니다." });
    }

    await Posts.update(
      { title, content, state },
      {
        where: { [Op.and]: [{ postId }, { UserId: userId }] }
      },
    )

    return res.status(200).json({ message: '상품이 수정되었습니다.', updatedPost: post });
  } catch (error) {
    res.status(500).json({ message: "예기치 못한 에러가 발생하였습니다." });
  }
})

// 상품 삭제
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const { userId } = res.locals.user;

    const post = await Posts.findOne({ where: { postId } });
    console.log(post)
    if (!post) {
      return res.status(404).json({ message: "상품이 존재하지 않습니다." });
    }
    if (post.UserId !== userId) {
      return res.status(401).json({ message: "권한이 없습니다." });
    }

    await Posts.destroy(
      {
        where: { [Op.and]: [{ postId }, { UserId: userId }] }
      },
    )

    return res.status(200).json({ message: '상품이 삭제되었습니다.', deletePost: post });
  } catch (error) {
    res.status(500).json({ message: "예기치 못한 에러가 발생하였습니다." });
  }
})


module.exports = router;