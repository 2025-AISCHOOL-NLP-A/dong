const express = require("express");
const app = express();
const mainRouter = require("./routes/mainRouter");

// EJS를 사용하기 위한 셋팅 -> app에게 앞으로 ejs 파일은 views에서 참고해라!
// * 주의점: 반드시 라우터 위에 작성한다. (항상 use 위에 작성 - 충돌 문제 때문!)
app.set("view engine", "ejs");  // 템플릿 엔진으로 ejs를 사용하겠다!
app.set("views", __dirname+"/views");   // 참고할 파일들은 views에 있다.

app.use("/",mainRouter);

app.listen(3000);