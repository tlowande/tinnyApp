
//SET UP 👇
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
// This tells the Express app to use EJS as its templating engine 👇
app.set("view engine", "ejs") 
// This converts the info that is being submitted by the form into human readable strings 👇
app.use(bodyParser.urlencoded({extended: true}));
//____________________________

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//________________________
let generateRandomStrings = function(){
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 7; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

//________________________
//ROUTE REQUESTS:
// app.get("/", (req, res) => {
//   res.send("Hello!");
// });
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
// this route should redirect user to the form and needs to come before the next get > always more specific to more general
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {
  console.log(req.params);
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

//ROUTE THAT POSTS THE FORM BODY AND RETURNS SOMETHING
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send();
});


// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});