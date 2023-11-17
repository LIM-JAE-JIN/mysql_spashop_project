const express = require("express");
const cookieParser = require("cookie-parser");
const userRouter = require("./routers/users.route");
const postRouter = require("./routers/posts.route");
const db = require("./models");
const app = express();
const port = 3016;


// Sequelize와 데이터베이스 연결 확인
db.sequelize.authenticate()
  .then(() => {
    console.log('DB연결성공');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


app.use(express.json());
app.use(cookieParser());
app.use('/api', [userRouter, postRouter]);

app.get('/api', (req, res) => {
  res.send("안녕하세요~");
});


app.listen(port, () => {
  console.log(port, "포트번호로 서버가 실행되었습니다.");
})


// 모델에서 테이블 가져오기
// const { sequelize } = require('./models/index.js');

// async function main() {
//   // model을 이용해 데이터베이스에 테이블을 삭제 후 생성합니다.
//   await sequelize.sync({ force: true });
// }

// main();