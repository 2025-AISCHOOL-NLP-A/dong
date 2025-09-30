const express = require("express");
const router = express.Router();
const conn = require("../config/db");

router.get("/",(req,res)=>{
    // 핵심: 반드시 값을 가지고 페이지를 제작할 때는, 초기값의 설정이 매우 중요하다!
    // 이유: 없으면 undefined 출력 -> 페이지 생성이 불가능! 
    // res.render("main",{user : null});
    res.render("main");
});

router.get("/login",(req,res)=>{    // get은 단순히 로그인 페이지를 가져오는 것
    res.render("login");
});

// 로그아웃 기능 구현 -> session 값을 삭제
router.get("/logout",(req,res)=>{
    req.session.destroy();
    res.redirect("/");
});

// 전체 회원 관련 코드 작성
// * get 방식으로 경로를 조회
// * DB에 연결해서 모든 사용자를 조회 -> id, nick만 조회 -> 쿼리문을 신경쓰자!
// * 조회된 모든 회원 정보를 리턴 -> 세션에 저장 X -> 페이지를 랜더링 (조회한 값을 전달) -> 리스트 타입
router.get("/userlist",(req, res)=>{ 
    let sql = "select id, nick from member";

    conn.query(sql, (err,rows)=>{ // conn.query(sql, ...) → DB(MySQL)에 select id, nick from member 실행
                                        // 조회 결과(rows)는 배열 형태로 들어옴 -> 예: [ {id: "user1", nick: "철수"}, {id: "user2", nick: "영희"} ]
        res.render("userlist",{userlist : rows}); // views/userlist.ejs 파일을 불러와서 -> rows 데이터를 userlist라는 이름으로 전달
    })
});
// ↑ DB에서 가져온 회원 목록(rows)을 EJS 템플릿에 전달해서 동적으로 HTML을 만들어주는 코드

router.post("/login",(req,res)=>{   // 로그인 경로 가져옴
    let {id,pw} = req.body;
    let sql = "select nick from member where id=? and pw=?";    // 닉네임 값만 가져옴

    conn.query(sql,[id,pw],(err,rows)=>{
        if(rows.length > 0){    // 0보다 크면 값이 있음 <-> 0 또는 0보다 작으면 값이 없음
            console.log(rows);
            
            // 핵심: 값을 넘길 때, 정확한 값을 넘기자
            // 이유: 출력하는 ejs에서 가장 간단하게 출력하는 게 가독성이 좋다!
            // res.render("main",{user : rows[0].nick}); -> 이렇게 넘기면 그 페이지(main.ejs)에서만 user 변수를 사용할 수 있음 (렌더링 시 넘겨준 값이니까, 다른 라우트에서는 사라짐)
            // ↓
            // 공용 공간인 session에 닉네임을 저장
            req.session.user = rows[0].nick; // 이렇게 하면 세션에 저장되기 때문에 로그인 후 다른 페이지로 이동해도 req.session.user를 통해 닉네임을 계속 불러올 수 있음 (서버가 꺼지거나 세션이 만료되기 전까지 유지됨)
            res.redirect("/");  // 렌더링이 아닌, 이미 만들어진 페이지를 재사용

        }else{
            console.log("저장된 값이 아님");
            // res.render("login"); -> 위에서 만든 로그인 페이지를 다시 렌더링할 필요 X
            res.redirect("/login");
        }
    })
});

module.exports = router;

/*
res.render, res.redirect, res.sendFile 차이

res.render("뷰파일", 데이터)
- 뷰 엔진을 사용해 동적 HTML 생성할 때
- 서버에서 EJS, Pug 같은 템플릿 엔진을 이용해 HTML을 생성할 때 사용
- views 폴더 안의 ejs 파일을 찾아서, 거기에 데이터를 전달하고 → 최종적으로 HTML을 만들어 브라우저에 응답
- 즉, SSR(Server-Side Rendering) 방식
    - res.render("main", { user: "홍길동" });
        - views/main.ejs 파일이 실행되고, <%= user %>에 "홍길동"이 들어가 HTML이 완성되어 클라이언트에게 전달됨

    - render 방식: 일회성, 특정 렌더링된 페이지 안에서만 사용 가능
    - session 방식: 공용 저장소, 이후 요청(req)에서도 계속 사용 가능
    -> 세션을 쓰려는 목적이 "로그인 유지"라면 req.session.user처럼 세션에 저장하는 게 맞음

res.redirect("경로")
- 특정 URL로 클라이언트를 이동시킬 때
- 다른 URL로 강제로 이동시킬 때 사용
- 서버가 HTML을 만들어주는 게 아니라, 브라우저에게 "저 주소로 다시 요청해라"라고 명령하는 것
- 로그인/로그아웃 후 다시 메인 페이지로 이동 같은 경우에 많이 씀
    - res.redirect("/");
        - 클라이언트가 / 경로로 새 요청을 보내도록 유도

res.sendFile("파일경로")
- 서버에 있는 정적 파일을 그대로 보낼 때
- 정적인 파일(HTML, 이미지, PDF 등)을 그대로 클라이언트에 보내줄 때 사용
- 템플릿 엔진이 필요 없고, 서버가 있는 그대로 파일을 전송
    - res.sendFile(__dirname + "/public/index.html");
        - HTML이나 이미지 같은 고정된 리소스를 그대로 응답할 때 적합
*/