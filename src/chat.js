const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const users = require('./users');
const chatTIP = require('./chatTIP');
const chatCommand = require('./chatCommand');
const chatValidate = require('./chatValidate');
const debug = require('debug')('slash-command-template:index');

// Object to hold in-progress tickets -- managed by chatHandler & chatTIP methods
const ticketsInProgress = {};

// Export function -- reads chat messages and sends them to the handler
const read = (chatEvent) => {
  // Ignoring all messages that have markers of being sent by this (or another) bot
  if (chatEvent.hasOwnProperty('subtype') || chatEvent.hasOwnProperty('bot_id') || chatEvent.channel_type !== 'im') {
    debug('chatEvent ignored in chat.js read');
    return;
  }

  // Gather info
  const user = chatEvent.user;
  const channel = chatEvent.channel;
  const text = chatEvent.text;
  const command = chatCommand.checkForCommand(text);
  let thisTicket = ticketsInProgress[user] || false;

  if (command) {
    // response is: { newTicket: (false or object), message: (string) }
    const response = chatCommand.execute(command, user);

    switch (command) {
      case 'cancel':
      case 'delete':
        if (!thisTicket) { break; }
        delete ticketsInProgress[user];
      case 'help':
      case 'silly':
        send(channel, response.message);
        return;
      case 'start':
      case 'ticket':
        if (thisTicket) {
          break;
        }
        thisTicket = response.newTicket;
        send(channel, response.message);
    }
  }

  // If no ticket created, and no command input, give help message
  if (!thisTicket) {
    send(channel, chatCommand.execute('help', user).message);
    return;
  }

  chatHandler(user, channel, text, thisTicket);
}

// Helper function to send chat message
const send = (channel, message = 'I am a bot. My name is Rob.') => {
  // Create new XML request with appropriate endpoint from Slack
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://slack.com/api/chat.postMessage', true);

  // Set headers.
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.setRequestHeader('Authorization', `Bearer ${process.env.SLACK_BOT_TOKEN}`);

  // Create the response!
  const payload = JSON.stringify({
    channel: channel,
    text: message,
    as_user: true,
  });

  // Handle responses -- mainly for testing, disable in production to avoid overwhelming logs
  // xhr.onreadystatechange = function() {
  //   if (this.readyState === XMLHttpRequest.DONE && this.status === 201) {
  //     console.log('Success');
  //   }
  //   else {
  //     console.log(this.status);
  //     console.log(this.responseText);
  //   }
  // };

  // A small delay makes the chat feel less abrupt
  // setTimeout(xhr.send, 150, payload);
  xhr.send(payload);
}

// Main function -- updates ticketsInProgress with incoming info until ready to send
const chatHandler = (user, channel, text, thisTicket) => {
  // Early return if response is invalid
  if (!chatValidate.isValid(text, thisTicket)) {
    send(channel, 'Invalid response. Please try again.');
    setTimeout(send, 500, channel, thisTicket.questions[thisTicket.onQuestion].query);
    return;
  }

  const nextQuestion = thisTicket.onQuestion + 1;

  // The first time we get here, we need to ask the first question!
  // onQuestion is initialized as -1
  if (nextQuestion === 0) {
    setTimeout(send, 1000, channel, thisTicket.questions[nextQuestion].query);
    //send(channel, thisTicket.questions[nextQuestion].query);
    thisTicket.onQuestion++;
    ticketsInProgress[user] = thisTicket;
  }

  // Case for chats that are replies to questions
  else if (nextQuestion < thisTicket.questions.howMany) {
    // Store the answer, increment the counter, send the next question
    thisTicket.questions[thisTicket.onQuestion].reply = text;
    thisTicket.onQuestion++;
    send(channel, thisTicket.questions[thisTicket.onQuestion].query);
    // Update the ticket in progress
    ticketsInProgress[user] = thisTicket;
  }
  // Case for last question answered
  else {
    // Remember to store the last answer!
    thisTicket.questions[thisTicket.onQuestion].reply = text;
    send(channel, 'Ok, great! I should have everything I need. Your ticket has been created, and you will hear from the web team shortly. :ticket: :white_check_mark:');
    chatTIP.sendTIP(thisTicket);
    delete ticketsInProgress[user];
  }
}

module.exports = { read, send };
