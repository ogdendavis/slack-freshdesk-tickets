// Receives chat messages that are direct mentions!

const read = (user, type, message) => {
  console.log('*********');
  console.log(user);
  console.log(type);
  console.log(message);
}

const makeTicket = (stuff) => {
  console.log(stuff);
}

module.exports = { read, makeTicket }
