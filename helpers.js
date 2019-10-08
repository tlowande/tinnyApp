//VARIABLES - DATABASE

const urlDatabase = {};

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
      urlById[url] = {
        long: urlDatabase[url].longURL,
        date: urlDatabase[url].date
      };
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

};