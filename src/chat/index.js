const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const users = require('../users');
const manageTIP = require('./manageTIP');
const chatCommand = require('./commands');
const chatValidate = require('./validate');
const debug = require('debug')('slash-command-template:index');

// Object to hold in-progress tickets -- managed by chatHandler & manageTIP methods
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

  xhr.send(payload);
}

// In chat, Slack converts written URLs into special objects in the format
// <[live url with protocol]|[url as typed by user]>.
// This messes with Freshdesk, so fix it!
const sanitizeChatText = (slackInput) => {
  // Helper function to reverse result of urlCheck
  const noUrl = (word) => {
    return !chatValidate.urlCheck(word);
  }
  // Split into an array so we can check each word
  const slackArray = slackInput.split(' ');
  
  if ( slackArray.every(noUrl) ) {
    return slackInput;
  }

  // Strip out Slack's special URL characters, and duplicate text
  const sanitizedArray = slackArray.map(word => {
    return word[0] === '<' ? word.replace(/[<>]/g, '').split('|')[0] : word;
  });
  return sanitizedArray.join(' ');
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

  // Sanitize input for Slack URL objects -- if not, URLs get lost in Freshdesk
  const sanitizedText = sanitizeChatText(text);

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
    thisTicket.questions[thisTicket.onQuestion].reply = sanitizedText;
    thisTicket.onQuestion++;
    send(channel, thisTicket.questions[thisTicket.onQuestion].query);
    // Update the ticket in progress
    ticketsInProgress[user] = thisTicket;
  }
  // Case for last question answered
  else {
    // Remember to store the last answer!
    thisTicket.questions[thisTicket.onQuestion].reply = sanitizedText;
    // Confirmation message below replaced by confirmation message in tickets.index sendUserConfirmation
    // send(channel, 'Ok, great! I should have everything I need. Your ticket has been created, and you will hear from the web team shortly. :ticket: :white_check_mark:');
    manageTIP.sendTIP(thisTicket);
    delete ticketsInProgress[user];
  }
}

module.exports = { read, send };
