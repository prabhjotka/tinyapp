function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}
const express = require("express");
var cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
app.use(express.urlencoded({ extended: true }));
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});
//creating a newUrl page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],

  };
  res.render("urls_new", templateVars);
});
//showing a short url version for longUrl
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id, longURL:
      urlDatabase[req.params.id],
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});
//adding to urldatabase
app.post("/urls", (req, res) => {
  const longURL1 = req.body.longURL;
  const shortUrl = generateRandomString(6);
  urlDatabase[shortUrl] = longURL1;

  res.redirect(`/urls/${shortUrl}`);

});
// get property for to follow the  link when user click on short url
app.get("/u/:id", (req, res) => {
  const templateVars = {
    id: req.params.id, longURL:
      urlDatabase[req.params.id]
  };
  res.redirect(templateVars.longURL);
});

//delete the url
app.post('/urls/:id/delete', (req, res) => {

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});
//edit the url
app.get("/urls", (req, res) => {
  const templateVars = {
    id: req.params.id, longURL:
      urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

//submit new url
app.post("/urls/:id", (req, res) => {

  //console.log(req.body);  for debugguing purpose
  urlDatabase[req.params.id] = req.body.newUrl;

  res.redirect("/urls/");

});
//Handle post to login to set cookie
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);

  res.redirect("/urls");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});