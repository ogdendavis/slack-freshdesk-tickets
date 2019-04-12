// Manages all incoming slash commands
const debug = require('debug')('slash-command-template:index');
const webticket = require('./webticket');
const webhelp = require('./webhelp');
const newaccount = require('./newaccount');

const execute = (command_text, desc_text, trigger_id, user_id, res) => {
  // If command executes successfully, success is redefined to true in switch/case
  let success = false;

  switch (command_text) {
    case '/ticket':
      success = webticket.execute(desc_text, trigger_id, res);
      break;
    case '/webhelp':
      success = webhelp.execute(user_id, res);
      break;
    case '/newaccount':
      success = newaccount.execute(trigger_id);
    default:
      debug('no recognized command');
  }

  if (success) {
    res.send('');
  }
  else {
    debug(`Command ${command_text} did not execute`);
    res.sendStatus(500);
  }
}

module.exports = { execute };
