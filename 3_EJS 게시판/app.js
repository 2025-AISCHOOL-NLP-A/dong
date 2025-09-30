const express = require("express");
const app = express();
const mainRouter = require("./routes/mainRouter");

// 설정
app.use(express.urlencoded({extended : true}));
app.set("view engine", "ejs");  // Express에게 "나는 뷰 엔진으로 ejs를 쓰겠다"라고 알려주는 설정
app.set("views", __dirname+"/views");

// 라우팅
app.use("/",mainRouter);

app.listen(3000);

// Express에서의 View Engine
//  - View Engine = 서버에서 HTML을 동적으로 만들어 주는 템플릿 엔진
//  - app.set("view engine", "ejs")라고 해두면:
//      - res.render("파일명", 데이터)를 호출할 때,
//      - Express가 views 폴더 안에서 "파일명.ejs" 파일을 자동으로 찾아서,
//      - EJS 문법(<% %>, <%= %> 등)을 해석하고,
//      - HTML 문자열을 만들어 클라이언트(브라우저)에 응답으로 보냄