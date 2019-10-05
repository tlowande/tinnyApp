
//SET UP 👇
const express = require("express");
let cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt'); // to hash passwords
const { urlsForUser, findUserByEmail, generateRandomStrings, users, urlDatabase } = require('./helpers');

//________________________________


// This tells the Express app to use EJS as its templating engine 👇
app.set("view engine", "ejs");
// This converts the info that is being submitted by the form into human readable strings 👇
app.use(bodyParser.urlencoded({ extended: true }));
//This parses cookie header and populates req.cookie/req.session with an object keyed by the cookie names.👇
app.use(cookieSession({ signed: false }));



//________________________
//ROUTE GET REQUESTS:

//homepage
app.get('/', (req, res) => {
  if (req.session['user_id']) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//logged in homepage
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session['user_id']),
    user: users[req.session['user_id']]
  };
  res.render("urls_index", templateVars);

});

// redirect user to make a new shortlink and needs to come before the next get => always more specific to more general👇
app.get("/urls/new", (req, res) => {
  if (!req.session['user_id']) {
    res.redirect('/login');
    return;
  }
  let templateVars = {
    user: users[req.session['user_id']]
  };
  res.render("urls_new", templateVars);
});

//presents the shor urls and the edit option
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

//redirects to login page
app.get('/login', (req, res) => {
  if (req.session['user_id']) {
    res.redirect('/urls');
    return;
  }
  res.render("urls_signin");
  return;
});

//redirects to register page
app.get('/register', (req, res) => {
  if (req.session['user_id']) {
    res.redirect('/urls');
    return;
  }
  res.render("urls_registration");
});

//👇THIS REDIRECTS THE USER TO THE WEBSITE REQUESTED BY CLICKING ON THE SHORT LINK
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    const m = { msg: 'Something is missing, please get the right url' }
    res.render("error", m);
    return;
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});



// POST ROUTES

//posts(sends) the longURL, log the body and its random key to the urlDataBase (locally here for this example) and redirect the page by calling the app.get("/urls/:shortURL"...👇
app.post("/urls", (req, res) => {
  const key = generateRandomStrings();
  if (req.body.longURL.includes('http://')) {
    urlDatabase[key] = { longURL: req.body.longURL, userID: req.session['user_id'] };
  } else {
    urlDatabase[key] = { longURL: 'http://' + req.body.longURL, userID: req.session['user_id']};
  }
  res.redirect("/urls/" + key);
});

// removes info from DB for the DELETE button and redirects to the main page
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session['user_id']) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
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
    res.redirect("/urls");
    return;
  }
  res.redirect("/urls");
});

// logs in and redirects to main page
app.post('/login', (req, res) => {

  let user = findUserByEmail(req.body.email, users);
  let m = { msg: "Ops, you don't have an account with this email, please <a href='/register'>register</a>"
  };
  if (!user) {
    res
      .status(403)
      .render('error', m);
    return;
  }

  if (user) {
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      let m = { msg: "Wrong Password, <a href='/login'>try again!</a>"};
      res
        .status(403)
        .render('error', m);
      return;
    }
  }

  req.session['user_id'] = user.id;
  res.redirect("/urls");
});

//removes cookies by logout and redirect to main page
app.post('/logout', (req, res) => {
  req.session['user_id'] = null;
  res.redirect("/urls");
});

//this route checks if user already exists and if it doesn't, it creates an ID and add to the DB
app.post('/register', (req, res) => {

  if (findUserByEmail(req.body.email, users)) {
    let m = {
      msg:"Ops, you already have an account with this email, please <a href='/login'> sign n </a>"
    };
    res
      .status(400)
      .render('error', m);
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

app.get("/*", (req, res) => {
  const m = { msg: 'Something is still missing, please get the right url' }
  res.render("error", m);
})

//THIS MAKES THE SERVER LISTEN TO THE REQUESTS THAT CMOMES FROM THE BROWSER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});