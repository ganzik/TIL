const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const fs = require('fs');
const cookieparser = require('cookie-parser');
const port = 3000; // configure server port
const FileStore = require('session-file-store')(session); // npm install --save session-file-store
const hasher = require('pbkdf2-password')(); // 암호화 모듈






// bodyParser > Static > Session

// configure app to use bodyParser
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

// 정적파일(Static files)다루기
app.use(express.static(path.join(__dirname, 'public')));

// ejs 모듈
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);


// session값은 서버에 저장이 되고 디폴트값으로 메모리에 저장이 된다. 서버를 껐다가 켜면 session 값은 날아간다. 옵션을 주면 원하는 위치에 세션값을 저장 할 수 있다.
app.use(session({
    secret: 'rkswlrGhkdlxld', // 쿠키를 임의로 변조하는것을 방지하기 위한 sign값. 원하는 값을 넣어주자
    resave: false, // 세션을 언제나(변하지 않아도)) 저장할 것인지 정하는 값. express-session documentation에서는 이 값을 false로 하는것을 권장하고 필요에 따라 true로 설정. 비효율적이기 때문에 false
    saveUninitialized: true, // uninitialized 세션이란 새로 생겼지만 변경되지 않은 세션을 의미한다. true로 설정 할 것을 권장한다.
    store: new FileStore() // session-file-store 모듈을 사용해서 세션값을 저장한다
}));

app.use(cookieparser());

// configure router
const router = require('./router/main')(app, fs);

// run server
app.listen(port, () => {
    console.log('Server listening ...' + port);
});