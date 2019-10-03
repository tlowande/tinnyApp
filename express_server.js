
//SET UP 👇
const express = require("express");
let cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt'); // to hash passwords
// This tells the Express app to use EJS as its templating engine 👇
app.set("view engine", "ejs");
// This converts the info that is being submitted by the form into human readable strings 👇
app.use(bodyParser.urlencoded({ extended: true }));
//This parse cookie header and populate req.cookie with an object keyed by the cookie names.👇
app.use(cookieSession({ signed: false }));
//____________________________

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'aj481w'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: 'aj481w1'
  }
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

// let checkEmail = (email) => {
//   for (let user in users) {
//     if (users[user].email === email) {
//       return true;
//     }
//   }
//   return false;
// }

let findUserByEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

let urlsForUser = (id) => {
  let urlById = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urlById[url] = urlDatabase[url].longURL;
    }
  }
  return urlById;
};

// console.log(urlsForUser ('aj481w1'));

//________________________
//ROUTE GET REQUESTS:

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session['user_id']),
    user: users[req.session['user_id']]
  };
  res.render("urls_index", templateVars);
});

// this route should redirect user to the form and needs to come before the next get => always more specific to more general👇
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session['user_id']]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.session['user_id']) {
    let dbPerUser = urlsForUser(req.session['user_id']);
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: dbPerUser[req.params.shortURL],
      user: users[req.session['user_id']]
    };
    res.render("urls_show", templateVars);
    return;
  }
  res.redirect("/urls");
});

app.get('/login', (req, res) => {
  res.render("urls_signin");
});

app.get('/register', (req, res) => {
  res.render("urls_registration");
});

//👇THIS REDIRECTS THE USER TO THE WEBSITE REQUESTED BY CLICKING ON THE SHORT LINK
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});



// POST ROUTES
//route that posts(sends) the form body, log the body and its random key to the urlDataBase (locally here for this example) and redirect the page by calling the app.get("/urls/:shortURL"...👇
app.post("/urls", (req, res) => {
  const key = generateRandomStrings();
  if (req.body.longURL.includes('http://')) {
    urlDatabase[key] = { longURL: req.body.longURL, userID: req.session['user_id'] };
  } else {
    urlDatabase[key] = { longURL: 'http://' + req.body.longURL, userID: req.session['user_id']};
  }
  res.redirect("/urls/" + key);
});

//route that updates short url using form and redirects to show page
app.post("/urls/:id", (req, res) => {
  if (req.session['user_id']) {
    const key = req.params.id;
    if (req.body.longURL.includes('http://')) {
      urlDatabase[key].longURL = req.body.longURL;
    } else {
      urlDatabase[key].longURL = 'http://' + req.body.longURL;
    }
    res.redirect("/urls/" + key);
  }
  res.redirect("/urls");
});

// logs in and redirects to main page
app.post('/login', (req, res) => {

  let user = findUserByEmail(req.body.email);

  if (!req.body.email || !req.body.password) {
    res.status(400).send("<h2>'Booo...We need an email address AND a password\n'</h2><a href='/login'> return </a>");
  }

  if (!user) {
    res
      .status(403)
      .send("<h2>'Ops, you don't have an account with this email, please register\n'</h2><a href='/register'> register </a>");
  }

  if (user) {
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      res
        .status(403)
        .send("<h2>Wrong Password, try again!\n</h2><a href='/login'> return </a>");
    }
  }

  req.session['user_id'] = user.id;
  res.redirect("urls");
});

//removes cookies by logout and redirect to main page
app.post('/logout', (req, res) => {
  
  req.session = null;
  res.redirect("urls");
});

// removes info from DB for the DELETE button and redirects to the main page
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session['user_id']) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
  res.redirect("/urls");
});

//this route checks if user already exists and if it doesn't, it creates an ID and add to the DB
app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("<h2>'Booo...We need an email address AND a password\n'</h2><a href='/register'> return </a>");
    return;
  }
  if (findUserByEmail(req.body.email)) {
    res
      .status(400)
      .send("<h2>'Ops, you already have an account with this email, please sign in\n'</h2><a href='/login'> Sign in </a>");
    return;
  }
  
  let id = generateRandomStrings();
  users[id] = {
    id: id,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  
  
  req.session['user_id'] = id;
  res.redirect('/urls');
});



//THIS MAKES THE SERVER LISTEN TO THE REQUESTS THAT CMOMES FROM THE BROWSER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});