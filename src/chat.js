const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
// const userProfile = require('./userProfile');
const ticket = require('./ticket')

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
      ticketsInProgress[userId] = makeNewTicket(userId);
    }
    chatHandler(chatEvent, ticketsInProgress[userId]);
  }
}

// Object to hold in-progress tickets -- managed by chatHandler()
const ticketsInProgress = {};

// Helper function to create new tickets for ticketsInProgress
// Modify this return object to control/change the content/order of questions
const makeNewTicket = (userId) => {
  const newTicket = {
    user: userId,
    onQuestion: null,
    questions: {
      0: {
        query: 'What client is this for?',
        reply: '',
      },
      1: {
        query: 'Give me a one-sentence overview of what you need.',
        reply: '',
      },
      2: {
        query: 'What\'s the URL of the website?',
        reply: '',
      },
      3: {
        query: 'What is the username to log in to the website?',
        reply: '',
      },
      4: {
        query: 'What is the password to log in to the website?',
        reply: '',
      },
      5: {
        query: 'Ok, let\'s dive in. What exactly is the issue? Is this a bug? A feature request? A content management issue? Tell me what you need me to do, with as much detail as you can give!',
        reply: '',
      },
      6: {
        query: 'Where can I find the resources I\'ll need to do the work? (Google Drive links are perfect!)',
        reply: '',
      },
      7: {
        query: 'When would you like me to have this project completed?',
        reply: '',
      },
    },
  };

  // Count how many questions there are -- used to determine when inquisition is over
  newTicket.questions.howMany = Object.keys(newTicket.questions).length;

  return newTicket;
}

// Helper function to update ticketsInProgress
const updateTIP = (newTicket, deleteTicket = false) => {
  if (deleteTicket) {
    delete ticketsInProgress[newTicket.user];
  }
  else {
    ticketsInProgress[newTicket.user] = newTicket;
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

// Helper function to make the Freshdesk ticket
const sendTicket = (finishedTicket) => {
  // Make an array of the answers, in order
  const submission = Object.keys(finishedTicket.questions).map(key => finishedTicket.questions[key].reply);

  // Put the info in the format required by ticket.create
  const formattedTicket = {
    title: submission[1],
    client: submission[0],
    url: submission[2],
    user: submission[3],
    pass: submission[4],
    description: submission[5],
    resources: submission[6],
    due: submission[7],
    urgency: '',
  }

  ticket.create(finishedTicket.user, formattedTicket);

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
    updateTIP(user, thisTicket);
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
      updateTIP(user, thisTicket);
    }
    else {
      chatSend(channel, 'Ok, I should have everything I need. Thanks!');
      sendTicket(thisTicket);
      updateTIP(thisTicket, true);
    }
  }
}

module.exports = { read }
