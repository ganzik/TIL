module.exports = (app, fs, hasher) => {
  app.get("/", (req, res) => {
    res.render("index.ejs", {
      title: "carhistory",
      length: 5
    });
  });

  app.get("/login", (req, res) => {
    res.render("login.ejs", {
      fmsg: req.flash("fmsg")
    });
  });

  app.post("/login", (req, res) => {
    console.log(req.body);
    let username = req.body.username;
    let password = req.body.password;
    let user = sampleUserList[username];
    console.log("username = ", username);
    console.log("password = ", password);
    console.log("userlist = ", sampleUserList);
    console.log(user);

    // 회원 정보가 sampleUserList에 존재 한다면
    if (user) {
      hasher(
        {
          password: password,
          salt: user.salt
        },
        function(err, pass, salt, hash) {
          if (err) {
            console.log("ERR : ", err);
            req.flash("fmsg", "오류가 발생했습니다.");
          }
          if (hash === user.password) {
            console.log("INFO : ", username, " 로그인 성공");

            req.session.user = sampleUserList[username];
            req.session.save(function() {
              res.redirect("/carlist");
            });
            return;
          } else {
            console.log("Password incorrect");
            req.flash("fmsg", "패스워드가 맞지 않습니다.");
            res.redirect("/login");
          }
        }
      );
    } else {
      // 회원 정보가 sampleUserList에 존재 하지 않는다면
      req.flash("fmsg", "회원 정보가 없습니다");
      res.redirect("/login");
    }
  });

  app.get("/logout", (req, res) => {
    req.session.destroy(); // 세션 삭제
    res.clearCookie("sid"); // 세션 쿠키 삭제
    res.redirect("back"); // 현재 페이지로 리다이렉트

    // 세션의 유저값만 삭제
    // if (req.session.user) {
    //  delete req.session.user;
    // }
  });

  app.get("/signup", (req, res) => {
    res.render("signup.ejs", {
      fmsg: req.flash("fmsg")
    });
  });

  // 회원가입 입력 폼을 받아 데이터를 저장
  app.post("/signup", (req, res) => {
    console.log(req.body);
    let username = req.body.username;
    let password = req.body.password;
    let name = req.body.name;
    let email = req.body.email;
    let user = sampleUserList[username];
    console.log("username = ", username);
    console.log("password = ", password);
    console.log("name = ", name);
    console.log("email = ", email);

    if (!user) {
      hasher(
        {
          password: req.body.password
        },
        (err, pass, salt, hash) => {
          if (err) {
            console.log("ERR: ", err);
            res.redirect("/signup");
          }
          let user = {
            username: username,
            password: hash,
            salt: salt, // 복호화 할 때 salt값이 필요
            name: name,
            email: email
          };

          //if (fs.existsSync('data/userlist.json')) {
          // sampleUserList.push(user); //배열을 사용 할 때는 push 메소드를 사용

          sampleUserList[username] = user;

          fs.writeFileSync(
            "data/userlist.json",
            JSON.stringify(sampleUserList, null, 2)
          );
          console.log("user added : ", user);
          // 회원가입이 끝나고 login 페이지로 이동
          res.redirect("/login");
          // }
        }
      );
    } else {
      req.flash("fmsg", "존재하는 회원입니다");
      res.redirect("/signup");
    }
  });

  // session 값으로 인증
  app.get("/carlist", (req, res) => {
    // console.log(req.session.user.username);
    // req.session.user.username을 하면 username이 undefined 되었다고 에러를 나타낸다. user 값 자체가 없는데 거기에 username까지 요구하기 때문이다. req.session.user까지만 사용하면 정상 작동하게 된다.
    if (req.session.user) {
      console.log("로그인된 사용자 접근");
      res.render("carlist.ejs", {
        carlist: sampleCarList
      });
    } else {
      console.log("로그인 안된 사용자 접근");
      res.send(
        `<script type="text/javascript">var choice = confirm("회원가입을 해야 접근 가능합니다. 회원가입 하시겠습니까?"); if(choice) {location.href = "/signup"} else {location.href = "/"}</script>`
      );
      // res.redirect('/signup');
    }
  });

  var sampleUserList = {};
  let rawdata = fs.readFileSync("data/userlist.json");
  // sampleUserList에 JSON 형식을 parse해서 입력한다.
  sampleUserList = JSON.parse(rawdata);
  // console.log(sampleUserList);

  // writeFile은 비동기 함수이다. 그래서 writeFileSync라는 동기 함수를 사용
  // sampleUserList는 객체이기 때문에 JSON.stringify로 형변환(자바스크립트 객체 -> JSON 형식) 시켜서 저장해준다.
  // fs.writeFileSync('data/userlist.json', JSON.stringify(sampleUserList, null, 2));
  // if(fs.existsSync('data/userlist.json')){}

  var sampleCarList = [
    {
      carNumber: "97주4633",
      owner: "홍길동",
      model: "SONATA",
      company: "HYUNDAI",
      numOfAccident: 2,
      numOfOwnerChange: 1
    },
    {
      carNumber: "23아3646",
      owner: "손오공",
      model: "MORNING",
      company: "KIA",
      numOfAccident: 1,
      numOfOwnerChange: 3
    },
    {
      carNumber: "57차4563",
      owner: "저팔계",
      model: "e350",
      company: "BENZ",
      numOfAccident: 3,
      numOfOwnerChange: 6
    },
    {
      carNumber: "79가3354",
      owner: "마인부우",
      model: "530i",
      company: "BMW",
      numOfAccident: 1,
      numOfOwnerChange: 0
    },
    {
      carNumber: "43다6345",
      owner: "천진반",
      model: "K7",
      company: "KIA",
      numOfAccident: 0,
      numOfOwnerChange: 2
    },
    {
      carNumber: "63로3242",
      owner: "부르마",
      model: "그랜져",
      company: "HYUNDAI",
      numOfAccident: 3,
      numOfOwnerChange: 1
    },
    {
      carNumber: "25나3342",
      owner: "피콜로",
      model: "G63",
      company: "BENZ",
      numOfAccident: 0,
      numOfOwnerChange: 0
    },
    {
      carNumber: "19자3953",
      owner: "도로시",
      model: "X5",
      company: "BMW",
      numOfAccident: 4,
      numOfOwnerChange: 2
    },
    {
      carNumber: "98주3873",
      owner: "그라마",
      model: "쏘렌토",
      company: "KIA",
      numOfAccident: 1,
      numOfOwnerChange: 3
    }
  ];

  app.get("/api/carlist", (req, res) => {
    res.json(sampleCarList);
  });

  app.post("/api/regcar", (req, res) => {
    console.log(req.body);
    sampleCarList.push(req.body);
    res.json([req.body]);
  });

  app.delete("/api/delcar", (req, res) => {
    console.log(req.body);
  });

  app.post("/api/search", (req, res) => {
    console.log(req.body);
    console.log(req.body.inputText);

    let carNum = req.body.inputText;

    // 배열의 find 함수를 활용
    let found = sampleCarList.find(element => {
      console.log("element = ", element);
      if (element.carNumber == carNum) {
        console.log("found");
        return element;
      }
    });
    console.log("found = ", found);

    res.json(found);
  });

  app.post("/api/filter", (req, res) => {
    console.log(req.body);
    console.log(req.body.inputText);
    console.log(req.body.selectVal);

    let inputData = req.body.inputText;
    let selectVal = req.body.selectVal;

    // 배열의 find 함수를 활용
    let found = sampleCarList.filter(element => {
      // 만약 콤보박스 셀렉트 밸류가 어떤것인지 확인 후 데이터처리
      if (selectVal == "company") {
        // console.log("element = ", element);
        if (element.company == inputData) {
          // console.log("found");
          return element;
        }
      } else if (selectVal == "model") {
        // console.log("element = ", element);
        if (element.model == inputData) {
          // console.log("found");
          return element;
        }
      }
    });
    console.log("found = ", found);

    res.json(found);
  });
};
