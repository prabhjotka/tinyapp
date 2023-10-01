const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });
// app.get("/", (req, res) => {
//   res.send("Hello!");
// });
app.get("/hello", (re, res) => {
  res.send("<html<body><h1>Welcome to my web page </h1></body></html> ");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});