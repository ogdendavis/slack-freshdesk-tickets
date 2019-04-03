const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const users = require('./users');
const chatTIP = require('./chatTIP');

// Object to hold in-progress tickets -- managed by chatTIP methods
const ticketsInProgress = {};

// Export function -- reads chat messages and sends them to the handler
const read = (chatEvent) => {
  // If it's a bot message or NOT a direct message, ignore it! This avoids infinite loops
  if (chatEvent.subtype === 'bot_message' || chatEvent.channel_type !== 'im') {
    return;
  }
  // If it's not a bot message, do stuff!
  else {
    const userId = chatEvent.user;
    // If the user doesn't have a ticket in progress, start one!
    if (!ticketsInProgress.hasOwnProperty(userId)) {
      ticketsInProgress[userId] = chatTIP.makeNewTIP(userId);
    }
    chatHandler(chatEvent, ticketsInProgress[userId]);
  }
}

// Helper function to send chat message
const chatSend = (channel, message = 'I am a bot. My name is Rob.') => {
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
    as_user: false,
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

  //setTimeout(xhr.send, 300, payload);
  xhr.send(payload);
}

// Main function -- updates ticketsInProgress with incoming info until ready to send
const chatHandler = (chatEvent, thisTicket) => {
  const user = chatEvent.user;
  const channel = chatEvent.channel;

  // Case for first question
  if (thisTicket.onQuestion === null) {
    chatSend(channel, 'Ok, let\'s make a new web support ticket for you!');
    setTimeout(chatSend, 1000, channel, thisTicket.questions[0].query);
    thisTicket.onQuestion = 0;
    // Update the ticket in progress
    ticketsInProgress[user] = thisTicket;
  }
  // Case for all others
  else {
    const nextQuestion = thisTicket.onQuestion + 1;
    if (nextQuestion < thisTicket.questions.howMany) {
      // Store the answer, increment the counter, send the next question
      thisTicket.questions[thisTicket.onQuestion].reply = chatEvent.text;
      thisTicket.onQuestion++;
      chatSend(channel, thisTicket.questions[thisTicket.onQuestion].query);
      // Update the ticket in progress
      ticketsInProgress[user] = thisTicket;
    }
    else {
      chatSend(channel, 'Ok, I should have everything I need. Thanks!');
      chatTIP.sendTIP(thisTicket);
      delete ticketsInProgress[user];
    }
  }
}

module.exports = { read }
