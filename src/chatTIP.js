// TIP = ticket in progress

// Helper function to create new tickets for ticketsInProgress
// Modify this return object to control/change the content/order of questions
const makeNewTIP = (userId) => {
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

module.exports = { makeNewTIP }
