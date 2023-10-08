const express = require("express");
let morgan = require('morgan');
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const { getUserByEmail } = require('./helpers.js');
const app = express();
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'user',
  keys: ['xdgfhfghfgdfgfdgfdg'],
}))
const PORT = 8080;    // default port 8080
app.set("view engine", "ejs");
//creating user object database
const users = {};
//creating url database object
const urlDatabase = {};

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
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(401).send(`<html><h2>Please login get access to url <h2><html>`);
  }
  const userUrls = urlsForUser(userId);
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
//post for urls//adding to urldatabase
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
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
  res.redirect(`/urls/${shortUrl}`);

});
//get / 
app.get("/", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    //return res.status(401).send(`<html><h2>Please login get access to url <h2><html>`);
    res.redirect('/login');
  }
  let user1 = "";
  if (userId || users[userId]) {

    user1 = users[userId];
  }

  const templateVars = {
    user: user1,
  };
  res.render("/urls", templateVars);

});

//get for  newUrl page
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    //return res.status(401).send(`<html><h2>Please login get access to url <h2><html>`);
    res.redirect('/login');
  }
  let user1 = "";
  if (userId || users[userId]) {

    user1 = users[userId];
  }

  const templateVars = {
    user: user1,
  };
  res.render("urls_new", templateVars);

});

//showing a short url version for longUrl
app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;

  const urlid = req.params.id;
  if (!userId) {
    return res.status(401).send(`<html><h2>Please login get access to url<h2><html>`);
    //return res.redirect('/login');
  }
  if (!urlDatabase[urlid]) {

    return res.status(404).send(`<h1>Shortened URL Not Found</h1>`);
  }
  const user = users[userId];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user,
  };
  res.render("urls_show", templateVars);

});

// get  u:id// to follow the  link when user click on short url
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
//post for  edit url
app.post('/urls/:id', (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(401).send(`<html><h2>Please login get access to url <h2><html>`);
    //return res.redirect('/login');
  }
  urlDatabase[req.params.id].longURL = req.body.newUrl;
  res.redirect("/urls/");

});

//delete the url
app.post('/urls/:id/delete', (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(401).send(`<html><h2>Please login get access to url<h2><html>`);
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});
//get for urls:id
app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id
  if (!userId) {
    return res.status(401).send(`<html><h2>Please login get access to url<h2><html>`);
    //return res.redirect('/login');
  }
  const templateVars = {
    id: req.params.id,
    // longURL: urlDatabase[req.params.id].longURL

    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

//get user registeration form info
app.get('/register', (req, res) => {
  const userId = req.session.user_id;
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
    return res.status(400).send(`<html><h2>Please enter email and password!<h2></html>`);
  }
  const founduser = getUserByEmail(userEmail, users);
  if (founduser !== null) {
    return res.status(400).send(`<html><h2>User already exist<h2></html>`);

  }
  const userid = generateRandomString(8);
  const hashedPassword = bcrypt.hashSync(userPassword, 10);
  users[userid] = {
    id: userid,
    email: userEmail,
    password: hashedPassword
  }
  req.session.user_id = userid;
  res.redirect('/urls');

});
//get user login
app.get('/login', (req, res) => {
  const userId = req.session.user_id;
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
//Handle post to login ansd set cookie
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const founduser = getUserByEmail(email, users);
  if (founduser === null) {
    return res.status(403).send("Credentials does not matc#########h");
  }
  const result = bcrypt.compareSync(password, founduser.password);

  if (!result) {
    return res.status(403).send("Credentials does not match");
  }
  const userid = founduser.id;
  req.session.user_id = userid;
  res.redirect("/urls");

});
//clear cookies when logout
app.post("/logout", (req, res) => {
  req.session = null;

  res.redirect("/login");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});