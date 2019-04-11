// Handles /webhelp command
const chat = require('../chat/index');
const debug = require('debug')('slash-command-template:commandTicket');

const execute = (user_id, res) => {
  try {
    chat.send(user_id, 'Hey, I heard you need some help with a website! :ambulance: :computer:\nIn this channel, just type `ticket` to start a web help ticket, or `help` for more info.');
    return true;
  }
  catch {
    debug('Call to chat.send failed in commands/webhelp');
    return false;
  }
}

module.exports = { execute };
