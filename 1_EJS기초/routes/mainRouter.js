const express = require("express");
const router = express.Router();

router.get("/",(req,res)=>{
    // res.sendFile(file_path+"/main.html"); -> 수업에서 지금까지는 res.sendFile()로 정적 HTML 파일을 직접 보냈음
    // 이제는 res.render("main", {...})을 사용해 /views/main.ejs 파일을 렌더링

    // 템플릿 엔진을 통해서 페이지를 제작할 때는 -> .render()
    res.render("main",{name : "이동인", login : true}); // EJS 템플릿에 전달되는 데이터 객체 -> main.ejs 안에서 <%= name %>라고 쓰면 이동인이 출력되고, <% if (login) { %> 같은 조건문에서 true로 평가됨
}); // app.js에서 주소를 명시해놨기 때문에 -> 여기서는 파일명만 명시

router.get("/userlist",(req,res)=>{
    let data = [{name : "정형", age : 20}, {name : "최영화", age : 40}]
    res.render("list",{data});  // res.render("list", { data }) → views/list.ejs 템플릿에 데이터 전달
});

module.exports = router;