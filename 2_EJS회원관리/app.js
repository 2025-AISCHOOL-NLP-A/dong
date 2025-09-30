const express = require("express");
const app = express();
const mainRouter = require("./routes/mainRouter");
const session = require("express-session");

// session 사용 등록
    // - express-session 미들웨어를 등록해서 클라이언트(브라우저)와 서버 간의 세션 관리를 할 수 있도록 설정하는 부분
    // - 사용자가 로그인하면 그 정보를 세션에 저장해 두고, 쿠키를 통해 브라우저와 연결을 유지함
app.use(
    session({
        secret : "mysecret", // 세션 ID를 암호화할 때 사용할 키(문자열) -> 안전하게 관리해야 함
        resave : false, // 세션에 변화가 없을 때도 매번 저장할지 여부 (비어있는 값을 자동으로 저장할 거냐?) -> false이면 불필요한 저장을 막음
        saveUninitialized : false, // 초기화되지 않은(값 없는) 세션을 강제로 저장할지 여부 -> false면 로그인 같은 상황에서만 세션 생성
        cookie : {  // 세션이 클라이언트 브라우저에 남는 방식 제어
            httpOnly : true, // 자바스크립트에서 쿠키 접근 차단 -> XSS 공격 방어
            secure : false, // HTTPS 환경에서만 동작할지 여부 -> 실제 배포 시에는 true 권장
            maxAge : 1000 * 60 * 30 // 쿠키 유효기간 = session의 생명 주기 (밀리초단위) : 1초 = 1000 밀리세컨드 * 60 = 1분 * 30 = 30분 -> 30분 지나면 로그인 정보 사라짐
        }
    })
);

// 넘겨온 세션 값을 전역 변수로 등록
    // - 세션에 저장된 user 값을 모든 EJS 뷰에서 바로 쓸 수 있도록 전역 변수로 등록하는 부분
app.use((req,res,next)=>{
    res.locals.user = req.session.user || null;
    // res.locals 객체는 EJS에서 자동으로 접근 가능 -> res.locals.user를 쓰면 현재 로그인한 사용자 정보가 나옴
    // 만약 세션에 user 정보가 없다면 null을 넘김 -> 로그인 상태와 비로그인 상태를 쉽게 구분할 수 있음
    // null 처리를 안 하면? -> 세션에 user가 없을 경우 res.locals.user 값이 undefined가 됨 (값이 정의되지 않음 <-> null: 값이 없음을 명시적으로 표현)
    next(); // 이 코드가 끝났으니, 다음 코드로 넘어가라는 뜻
});

// post 데이터 처리 (원래는 바디-파서 사용 -> 업데이트: express만으로 해결)
app.use(express.urlencoded({extended : true}));

// ejs 셋팅
// - 현재는 SSR(Server Side Rendering) 방식으로 EJS 뷰 엔진을 사용
// - 만약 CSR(Client Side Rendering)로 React를 쓴다면 -> views 폴더 대신 React 프로젝트 폴더를 사용하게 됨
app.set("view engine","ejs");
app.set("views",__dirname+"/views");

// 라우터 등록 (보통 라우터를 맨 밑에 등록 -> post 방식으로 데이터를 처리하겠다는 정의 없이, 라우터를 등록하면 작동 X)
app.use("/",mainRouter);

app.listen(3000);

/*
전체 흐름 정리

1. 세션 설정
    - 서버가 실행되면 express-session 미들웨어가 등록됨
    - 세션은 secret 키로 암호화되어 저장되고, 브라우저에는 세션 쿠키가 발급됨
    - 쿠키는 httpOnly, secure, maxAge(30분) 옵션에 따라 동작함

2. 사용자 로그인 시
    - 로그인 성공 → req.session.user = { ... } 형태로 사용자 정보를 세션에 저장
    - 세션에 정보가 담기면 브라우저는 발급받은 세션 쿠키로 이후 요청마다 사용자 식별 가능

3. 요청 처리 과정
    - 매 요청마다 미들웨어가 실행되어 res.locals.user = req.session.user || null 등록
    - 따라서 EJS 같은 뷰 템플릿에서 user 변수를 전역처럼 바로 사용할 수 있음
    - 로그인 상태라면 user 객체가, 로그아웃 상태나 세션이 없으면 null이 들어감

4. 뷰 렌더링(EJS)
    - res.locals.user 값은 EJS에서 <%= user.username %> 같은 방식으로 접근 가능
    - 로그인 여부에 따라 UI를 다르게 보여줄 수 있음 (예: 로그인 버튼 vs 로그아웃 버튼)

5. 세션 만료
    - 쿠키의 maxAge(30분)가 지나거나 로그아웃 처리 시 → req.session.user 삭제
    - 그 뒤 요청부터는 res.locals.user = null이 되어 로그인 상태가 해제됨
*/