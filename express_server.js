
//SET UP 👇
const express = require("express");
var cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
// This tells the Express app to use EJS as its templating engine 👇
app.set("view engine", "ejs");
// This converts the info that is being submitted by the form into human readable strings 👇
app.use(bodyParser.urlencoded({extended: true}));
//This parse Cookie header and populate req.cookies with an object keyed by the cookie names.👇
app.use(cookieParser())
//____________________________

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//________________________
let generateRandomStrings = () => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

//________________________
//ROUTE REQUESTS:
// app.get("/", (req, res) => {
//   res.send("Hello!");
// });
app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase, 
    username: req.cookies.username
  };
  res.render("urls_index", templateVars);
});
// this route should redirect user to the form and needs to come before the next get > always more specific to more general
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies.username
  }
  res.render("urls_new", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username
  };
  res.render("urls_show", templateVars);
});

//ROUTE THAT POSTS(sends) THE FORM BODY AND RETURNS SOMETHING
app.post("/urls", (req, res) => {
  const key = generateRandomStrings();
  if (req.body.longURL.includes('http://')) {
    urlDatabase[key] = req.body.longURL;
  } else {
    urlDatabase[key] = 'http://' + req.body.longURL;
  }
  // Log the body and its random key to the urlDataBase (locally here for this example) ☝️
  res.redirect("/urls/" + key);
});
// Redirect the page by calling the app.get("/urls/:shortURL"... ☝️

//ROUTE THAT UPDATES SHORT URL using FORM AND RETURNS to show page
app.post("/urls/:id", (req, res) => {
  const key = req.params.id;
  if (req.body.longURL.includes('http://')) {
    urlDatabase[key] = req.body.longURL;
  } else {
    urlDatabase[key] = 'http://' + req.body.longURL;
  }
  // Log the body and its random key to the urlDataBase (locally here for this example) ☝️
  res.redirect("/urls/" + key);
});

app.post('/login', (req, res) => {
  res
    .cookie('username', req.body['username'])
    .redirect("urls")
})

app.post('/logout', (req, res) => {
  res
    .clearCookie('username')
    .redirect("urls")
})

//👇THIS REDIRECTS THE USER TO THE WEBSITE REQUESTED BY CLICKING ON THE SHORT LINK
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


//ROUTE THAT DELETES URL using FORM AND RETURNS to main page
app.post("/urls/:shortURL/delete", (req, res) => {
  
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

//THIS MAKES THE SERVER LISTEN TO THE REQUESTS THAT CMOMES FROM THE BROWSER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});