const express = require("express");
const router = express.Router();
const conn = require("../config/db")

// 1. 사용자가 메인에 방문하면 db에 있는 전체 게시글의 정보를 가져와서 메인페이지에 출력
router.get("/",(req,res)=>{
    // 1) 전체 게시글 조회하는 sql문 작성
    // 2) conn 통해서 쿼리문을 실행 * 넘겨줄 값은 없다.
    // 3) 메인 페이지를 랜더링 + posts 키로 넘겨 받은 모든 데이터 넣어주기
    let sql = "select * from board";
    conn.query(sql,(err,rows)=>{ // conn(DB 연결 객체)을 통해 SQL을 실행 -> 첫 번째 인자: 실행할 SQL문 (sql) + 두 번째 인자: 실행 후 불릴 콜백 함수 (err: 에러가 발생했을 때 정보가 들어옴 / rows: SQL 실행 결과(조회된 데이터)가 배열 형태로 들어옴)
        console.log(rows);
        res.render("main", {posts : rows}); // views/main.ejs 파일을 렌더링해서 브라우저에 전송 -> { posts: rows }: EJS에 데이터를 넘김 (posts → EJS에서 쓸 수 있는 변수명 : rows → DB에서 조회한 실제 데이터)
    })
});

// 2. 특정 게시글을 조회해서 상세페이지를 제작
// 핵심: 게시글의 번호를 받아와서 해당 게시글만 조회
router.get("/board/:id",(req,res)=>{ // a태그는 무조건 GET 요청만 보냄 + :id는 URL 파라미터 (동적으로 변하는 값)
    let id = req.params.id; // 사용자가 /board/3 으로 접속하면 -> req.params = { id: "3" } = 따라서 req.params.id = "3"
    console.log(id);

    // * 조회수 1 증가하는 로직 작성
    let sql2 = "update board set hit = hit+1 where id = ?"
    conn.query(sql2,[id]);

    // 1) 각 id에 해당하는 게시글 정보를 수집 -> db에서
    let sql = "select * from board where id = ?"
    conn.query(sql,[id],(err,rows)=>{
        console.log(rows);
        res.render("detail",{post : rows[0]})
    })
});

// 3. 게시글 입력페이지 제작
// * 포인트: 단순 입력폼 제작
router.get("/write",(req,res)=>{
    res.render("write");
});

// 4. 게시글 입력기능(DB)
router.post("/write",(req,res)=>{
    // 1) 보내온 3개의 데이터 받기 (제목, 작성자, 내용) -> post
    let { title, writer, content } = req.body;
    // 2) insert 쿼리문 작성
    let sql = "insert into board (title, writer, content) values (?,?,?)"
    // 3) 값을 입력하는 로직 작성 -> conn -> 입력이 완료되면 메인페이지로 이동
    conn.query(sql,[title,writer,content],(err,rows)=>{
        if(rows.affectedRows > 0){
            res.redirect("/")
        }
    })
});

// 5. 게시글 수정폼 제작
router.get("/edit/:id",(req,res)=>{
    let id = req.params.id;
    let sql = "select * from board where id = ?";
    conn.query(sql,[id],(err,rows)=>{
        res.render("edit",{post : rows[0]})
    })
});

// 6. 입력 받은 데이터를 활용해서 DB 값을 수정
router.post("/edit/:id",(req,res)=>{
    let id = req.params.id;
    let {title,writer,content} = req.body;
    let sql = "update board set title = ?, writer = ?, content = ? where id = ?";
    conn.query(sql,[title, writer, content, id],(err,rows)=>{
        res.redirect("/board/"+id);
    })
});

// 7. 게시글 삭제
router.post("/delete/:id",(req,res)=>{
    let id = req.params.id;
    let sql = "delete from board where id=?";
    conn.query(sql,[id],(err,rows)=>{
        if(rows.affectedRows > 0){
            res.redirect("/");
        }
    })
});

module.exports = router;

// :id → URL에서 동적으로 변하는 값
// req.params.id → 그 값을 읽어옴
// let id = req.params.id; → 변수 id에 저장해서 SQL 쿼리나 로직에 사용