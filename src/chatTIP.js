// TIP = ticket in progress
const ticket = require('./ticket');

// Helper function to create new tickets for ticketsInProgress
// Modify this return object to control/change the content/order of questions
const makeNewTIP = (userId) => {
  const newTicket = {
    user: userId,
    onQuestion: -1,
    questions: {
      0: {
        query: 'What client is this for?',
        reply: '',
      },
      1: {
        query: 'Give me an overview of what you need in just a few words.',
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

// Helper function to make the Freshdesk ticket from the (finished) TIP
const sendTIP = (finishedTicket) => {
  // Make an array of the answers, in order
  const submission = Object.keys(finishedTicket.questions).map(key => finishedTicket.questions[key].reply);

  // Put the info in the format required by ticket.create
  const formattedTicket = {
    title: submission[1],
    client: submission[0],
    url: slackSanitize(submission[2]),
    user: submission[3],
    pass: submission[4],
    description: submission[5],
    resources: slackSanitize(submission[6]),
    due: submission[7],
    urgency: '',
  }

  ticket.create(finishedTicket.user, formattedTicket);
}

// Slack reformats message input that it recognizes as urls
// If starts with protocol: 'http://google.com' => '<http://google.com>'
// If no protocol: 'google.com' => '<http://google.com|google.com>'
// This effs with ticket creation, so strip out the extra to pass a simple string
const slackSanitize = (text) => {
  return text.split('|')[0].slice(1,-1);
}

module.exports = { makeNewTIP, sendTIP };
