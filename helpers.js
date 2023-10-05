//function to get user by email
const getUserByEmail = ((email, users) => {
  let founduser = null;
  //let founduser = undefined;  //For testing
  for (let userid in users) {
    const user = users[userid];
    if (email === user.email) {
      founduser = user;
    }
  }
  return founduser;
});


module.exports = { getUserByEmail };