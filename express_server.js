
//SET UP 👇
const express = require("express");
let cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
// This tells the Express app to use EJS as its templating engine 👇
app.set("view engine", "ejs");
// This converts the info that is being submitted by the form into human readable strings 👇
app.use(bodyParser.urlencoded({ extended: true }));
//This parse Cookie header and populate req.cookies with an object keyed by the cookie names.👇
app.use(cookieParser());
//____________________________

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

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

let checkEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
}

//________________________
//ROUTE REQUESTS:

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render("urls_index", templateVars);
});

// this route should redirect user to the form and needs to come before the next get => always more specific to more general👇
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies.username
  };
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

app.get('/register', (req, res) => {
  res.render("urls_registration")
})

// POST ROUTES
//route that posts(sends) the form body, log the body and its random key to the urlDataBase (locally here for this example) and redirect the page by calling the app.get("/urls/:shortURL"...👇
app.post("/urls", (req, res) => {
  const key = generateRandomStrings();
  if (req.body.longURL.includes('http://')) {
    urlDatabase[key] = req.body.longURL;
  } else {
    urlDatabase[key] = 'http://' + req.body.longURL;
  }
  res.redirect("/urls/" + key);
});

//route that updates short url using form and redirects to show page
app.post("/urls/:id", (req, res) => {
  const key = req.params.id;
  if (req.body.longURL.includes('http://')) {
    urlDatabase[key] = req.body.longURL;
  } else {
    urlDatabase[key] = 'http://' + req.body.longURL;
  }
  res.redirect("/urls/" + key);
});

//add cookies and redirect login to main page
app.post('/login', (req, res) => {
  res
    .cookie('username', req.body['username'])
    .redirect("urls");
});

//removes cookies by logout and redirect to main page
app.post('/logout', (req, res) => {
  res
    .clearCookie('username')
    .redirect("urls");
});

// removes info from DB for the DELETE button and redirects to the main page
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//this route checks if user already exists and if it doesn't, it creates an ID and add to the DB
app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("<h2>'Booo...We need an email address AND a password\n'</h2><a href='/register'> return </a>")
  };
  if (checkEmail(req.body.email)) {
    res
      .status(400)
      .send("<h2>'Ops, you already have an account with this email, please sign in\n'</h2><a href='/register'> return </a>")
      }
  let id = generateRandomStrings()
  users[id] = {
    id: id,
    email: req.body.email,
    password: req.body.password
  }
  res
    .cookie('user_id', id)
    .redirect('/urls')
})


//👇THIS REDIRECTS THE USER TO THE WEBSITE REQUESTED BY CLICKING ON THE SHORT LINK
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


//THIS MAKES THE SERVER LISTEN TO THE REQUESTS THAT CMOMES FROM THE BROWSER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});