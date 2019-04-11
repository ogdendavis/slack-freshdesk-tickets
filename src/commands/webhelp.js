// Handles /webhelp command
const chat = require('../chat');

const execute = (user_id, res) => {
  chat.send(user_id, 'Hey, I heard you need some help with a website! :ambulance: :computer:\nIn this channel, just type `ticket` to start a web help ticket, or `help` for more info.');
  res.send('');
}

module.exports = { execute };
