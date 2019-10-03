//VARIABLES - DATABASE 

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


//____________________________
//FUNCTIONS


let generateRandomStrings = () => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};


let findUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
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

module.exports = {
  urlsForUser,
  findUserByEmail,
  generateRandomStrings,
  users,
  urlDatabase

}