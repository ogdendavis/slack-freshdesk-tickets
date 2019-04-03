// Used to identify and execute commands in incoming chat messages
const chatTIP = require('./chatTIP');

const checkForCommand = (text) => {
  // Convert chatText to lowercase and remove punctuation
  const input = text.toLowerCase().replace(/\W/g, '');
  // Check array of known commands against input
  return ['start','cancel','delete','help','silly'].includes(input) ? input : false;
}

const execute = (command, user=false) => {
  const response = { newTicket: false, message: `You did a ${command}!`, }

  switch (command) {
    case('start'):
      response.newTicket = chatTIP.makeNewTIP(user);
      response.message = 'Ok, let\'s make a new web support ticket for you! :computer: :ticket: :sunglasses:';
      break;
    case('cancel'):
    case('delete'):
      response.message = 'Ok, I\'m deleting this ticket. :ticket: :x:\nIf you want to start another ticket, just send me another message, or use the /ticket command!';
      break;
    case('help'):
      response.message = ':wave: Hi, I\'m Rob Bot, your friendly neighborhood web help robot! :robot_face:\nI\'m here to help you make a Freshdesk ticket for web support issues.\n\nHere are the commands you can give me:\n* `start` - Start a ticket! :white_check_mark:\n* `cancel` or `delete` - Delete the ticket currently in progress. :x:\n* `help` - See this helpful message again! :scroll:\n\nThat\'s it. Happy ticketing!';
      break;
  }

  return response;
}

module.exports = { checkForCommand, execute };
