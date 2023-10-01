const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id, longURL:
      urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});
// app.get("/hello", (re, res) => {
//   res.send("<html<body><h1>Welcome to my web page </h1></body></html> ");
// });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});