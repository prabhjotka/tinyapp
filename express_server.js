const express = require("express");
let cookieParser = require('cookie-parser');
let morgan = require('morgan');
const app = express();
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
//creating user object database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "sam@gmail.com",
    password: "12345",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "abc@gmail.com",
    password: "6789",
  },
}
//creating url database object
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
};

//function to generate random id's
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}
//function to get user by email
const getUserByEmail = ((email) => {
  let founduser = null;

  for (let userid in users) {
    const user = users[userid];
    if (email === user.email) {
      founduser = user;
    }
  }
  return founduser;
});
//function to get urls for specific user logged in
const urlsForUser = ((userid) => {
  const userUrls = {
    shortUrls: [],
    longUrls: [],
  };

  for (let shortURL in urlDatabase) {
    const urlData = urlDatabase[shortURL];
    if (urlData.userID === userid) {
      userUrls.shortUrls.push(shortURL);
      userUrls.longUrls.push(urlData.longURL);
    }
  } return userUrls;
});

//get/urls
app.get("/urls", (req, res) => {
  let shorturls = [];
  const userId = req.cookies.user_id;
  if (!userId) {
    // const errMessage = "Please login get access to url";
    // res.render('/login', { errMessage });
    // return;
    return res.status(401).send(`<html><h2>Please login get access to url<h2><html>`);
  }
  const userUrls = urlsForUser(userId)
  console.log("user url is", userUrls);

  let user1 = "";
  if (userId || users[userId]) {

    user1 = users[userId];
  }

  const templateVars = {
    user: user1,
    urls: userUrls
  }
  res.render("urls_index", templateVars);
});
//creating a newUrl page
app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;
  let user1 = "";
  if (userId || users[userId]) {

    user1 = users[userId];
  }

  const templateVars = {
    user: user1,


  };
  user1 ? res.render("urls_new", templateVars) : res.redirect('/login')

});
//showing a short url version for longUrl
app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id;
  const urlid = req.params.id;
  if (!userId) {
    return res.status(401).send(`<html><h2>Please login get access to ur<h2><html>`);
    //return res.redirect('/login');
  }
  const user = users[userId];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user,
  };
  res.render("urls_show", templateVars);
  if (!urlDatabase[urlid]) {

    return res.status(404).send(`<h1>Shortened URL Not Found</h1>`);
  }

});
//post for urls//adding to urldatabase
app.post("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  let user1 = "";
  if (userId || users[userId]) {

    user1 = users[userId];
  }
  if (!user1) {
    return res.send('<h2>User must login before create  a url </h2>')
  }
  const longURL1 = req.body.longURL;
  const shortUrl = generateRandomString(6);
  urlDatabase[shortUrl] = {
    longURL: longURL1,
    userID: userId
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortUrl}`);

});
// get property  to follow the  link when user click on short url
app.get("/u/:id", (req, res) => {
  const urlid = req.params.id;
  if (urlDatabase[urlid]) {
    const templateVars = {
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL
    };

    res.redirect(templateVars.longURL);
  }
  else {
    res.status(404).send(`<h1>Shortened URL Not Found</h1>`);
  }

});

//delete the url
app.post('/urls/:id/delete', (req, res) => {
  const userId = req.cookies.user_id;
  if (!userId) {
    return res.status(401).send(`<html><h2>Please login get access to ur<h2><html>`);
    //return res.redirect('/login');
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});
//edit the url
app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  if (!userId) {
    return res.status(401).send(`<html><h2>Please login get access to ur<h2><html>`);
    //return res.redirect('/login');
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});

//submit new url
app.post("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id;
  if (!userId) {
    return res.status(401).send(`<html><h2>Please login get access to ur<h2><html>`);
    //return res.redirect('/login');
  }
  urlDatabase[req.params.id] = req.body.newUrl;

  res.redirect("/urls/");

});

//clear cookies when logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');

  res.redirect("/login");
});
//get user registeration form info
app.get('/register', (req, res) => {
  const userId = req.cookies.user_id;
  let user1 = "";
  if (userId || users[userId]) {

    user1 = users[userId];
  }
  const templateVars = {
    user: user1,

  };

  res.render('userResgister', templateVars);

});
//post/register/save info into user database object and set cookie with user_id
app.post('/register', (req, res) => {

  const userEmail = req.body.email;
  const userPassword = req.body.password;
  if (!userEmail || !userPassword) {
    return res.status(400).send("Please enter email and password!");
  }
  const founduser = getUserByEmail(userEmail);
  if (founduser !== null) {
    return res.status(400).send("User already exist");

  }
  const userid = generateRandomString(8);

  users[userid] = {
    id: userid,
    email: userEmail,
    password: userPassword
  }
  res.cookie('user_id', userid);
  res.redirect('/urls');

});
//get user login
app.get('/login', (req, res) => {
  const userId = req.cookies.user_id;
  let user1 = "";
  if (userId || users[userId]) {

    user1 = users[userId];
  }
  const templateVars = {
    user: user1,

  };
  res.render('userLogin', templateVars);
})
//post user login
//Handle post to login to set cookie
app.post("/login", (req, res) => {
  const email = req.body.email;
  const founduser = getUserByEmail(email);
  console.log("found user is", founduser);
  if (founduser === null) {
    res.status(403).send("Credentials does not match");
  }
  else if (founduser !== null) {
    if (founduser.password !== req.body.password) {
      res.status(403).send("Credentials does not match");
    }
  }
  const userid = founduser.id;
  res.cookie('user_id', userid);
  res.redirect("/urls");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});