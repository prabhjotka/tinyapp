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
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
app.use(express.urlencoded({ extended: true }));
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id, longURL:
      urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
  const longURL1 = req.body.longURL;
  const shortUrl = generateRandomString(6);
  urlDatabase[shortUrl] = longURL1;

  res.redirect(`/urls/${shortUrl}`);

});
// get property for to follow the  link whane user click on short url
app.get("/u/:id", (req, res) => {
  const templateVars = {
    id: req.params.id, longURL:
      urlDatabase[req.params.id]
  };
  res.redirect(templateVars.longURL);
});


app.post('/urls/:id/delete', (req, res) => {

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});