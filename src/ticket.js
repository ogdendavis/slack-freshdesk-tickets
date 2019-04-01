const axios = require('axios');
const debug = require('debug')('slash-command-template:ticket');
const qs = require('querystring');
const users = require('./users');

// XMLHttpRequest lives in browsers, but we had to npm install it on the server
// So require it!
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

/*
 *  Send ticket creation confirmation via
 *  chat.postMessage to the user who created it
 */
const sendConfirmation = (ticket) => {
  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: ticket.userId,
    as_user: true,
    text: 'Web help ticket created!',
    attachments: JSON.stringify([
      {
        title: `Ticket created for ${ticket.userEmail}`,
        // Get this from the 3rd party helpdesk system
        title_link: 'http://example.com',
        text: ticket.text,
        fields: [
          {
            title: 'Title',
            value: ticket.title,
          },
          {
            title: 'Client',
            value: ticket.client,
          },
          {
            title: 'Website',
            value: ticket.url,
          },
          {
            title: 'Description',
            value: ticket.description,
          },
          {
            title: 'Resources',
            value: ticket.resources,
          },
          {
            title: 'Requested completion date',
            value: ticket.due,
          },
          {
            title: 'Urgency',
            value: ticket.urgency,
            short: true,
          },
          {
            title: 'Status',
            value: 'Open',
            short: true,
          },
        ],
      },
    ]),
  })).then((result) => {
    debug('sendConfirmation: %o', result.data);
  }).catch((err) => {
    debug('sendConfirmation error: %o', err);
    console.error(err);
  });
};

// Send ticket to Freshdesk
const createFreshTicket = (ticket) => {
  console.log('createFreshTicket');
  // Create new XML request with appropriate endpoint from Freshdesk
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://sachsmedia.freshdesk.com/api/v2/tickets', true);

  // Set headers. Not sure about the Authorization header?
  xhr.setRequestHeader('Content-Type', 'application/json');
  const authorize = `Basic ${Buffer.from(process.env.FRESHDESK_API_KEY + ':X').toString('base64')}`;
  xhr.setRequestHeader('Authorization', authorize);

  // Set values from Slack ticket
  const priority = ticket.urgeny === 'Low' ? 1 :
                   ticket.urgency === 'High' ? 3 : 2;

  const ticketBody = 'Client: ' + ticket.client + '<br>Website: ' + ticket.url + '<br>Username: ' + ticket.user + '<br>Password: ' + ticket.pass + '<br>Description:<br>' + ticket.description + '<br>Resources: ' + ticket.resources + '<br>Requested Due Date: ' + ticket.due + '<br>Urgency: ' + ticket.urgency;

  // Create JSON object with data for the Freshdesk ticket
  const payload = JSON.stringify({
    'email': ticket.userEmail,
    'subject': ticket.title,
    'description': ticketBody,
    'status': 2,
    'priority': priority,
    'source': 7,
  });

  // Send it!
  xhr.send(payload);
};

// Create helpdesk ticket. Call users.find to get the user's email address
// from their user ID
const create = (userId, submission) => {
  const ticket = {};

  const fetchUserEmail = new Promise((resolve, reject) => {
    users.find(userId).then((result) => {
      debug(`Find user: ${userId}`);
      resolve(result.data.user.profile.email);
    }).catch((err) => { reject(err); });
  });

  fetchUserEmail.then((result) => {
    ticket.userId = userId;
    ticket.userEmail = result;
    ticket.title = submission.title;
    ticket.client = submission.client;
    ticket.url = submission.url;
    ticket.user = submission.user;
    ticket.pass = submission.pass;
    ticket.description = submission.description;
    ticket.resources = submission.resources;
    ticket.due = submission.due;
    ticket.urgency = submission.urgency;
    sendConfirmation(ticket);
    // Sends ticket to Freshdesk
    createFreshTicket(ticket);

    return ticket;
  }).catch((err) => { console.error(err); });
};

module.exports = { create, sendConfirmation };
