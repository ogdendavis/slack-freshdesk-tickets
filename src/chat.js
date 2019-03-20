// To send requests
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
// To encode strings for old-school Slack requests
const qs = require('querystring');

// Object to hold in-progress tickets -- managed by chatter()
const ticketsInProgress = {};

// Export function -- reads chat messages to bot, decides on response, sends it
const read = (chatEvent) => {
  // If it's a bot message, ignore it! This avoids infinite loops
  if (chatEvent.subtype === 'bot_message') {
    return;
  }
  // If it's not a bot message, do stuff!
  else {
    console.log(chatEvent);
    chatter(chatEvent);
  }
}


// Helper function to send chat message
const chatSend = (channel, message = 'I am a bot. My name is Rob.') => {
  // Create new XML request with appropriate endpoint from Slack
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://slack.com/api/chat.postMessage', true);

  // Set headers.
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.setRequestHeader('Authorization', `Bearer ${process.env.SLACK_OAUTH_TOKEN}`);

  // Create the response!
  const payload = JSON.stringify({
    channel: channel,
    text: message,
    as_user: false,
    username: 'rob_bot',
  });

  xhr.send(payload);
};

// Main function -- maintains object with info for ticket until ready to send
const chatter = (chatEvent) => {
  // Setup: Get user, and see if there's a ticket in progress
  // Removing for now -- need to set up async/await or Promise to let call resolve
  // const user = getUserInfo(chatEvent.user);

  const newTicket = ticketsInProgress.hasOwnProperty(chatEvent.user) ? false : true;

  if (newTicket) {
    chatSend(chatEvent.channel, `Ok, let's make a new web support ticket for you!`);
  }
}

// Helper function to make the Freshdesk ticket
const makeTicket = (stuff) => {
  console.log(stuff);
}

module.exports = { read, makeTicket }
