// Creates tickets for new SMG Communications Accounts
const axios = require('axios');
const debug = require('debug')('slash-command-template:ticket');
const qs = require('querystring');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

// Creates ticket
const build = (ticketData) => {
  const ticket = {};

  ticket.type = ticketData.type;
  ticket.userId = ticketData.userId;
  ticket.userEmail = ticketData.userEmail;
  ticket.requestor = ticketData.submission.requestor;
  ticket.requestorEmail = ticketData.submission.requestor_email;
  ticket.office = ticketData.submission.office;
  ticket.firstName = ticketData.submission.first;
  ticket.lastName = ticketData.submission.last;
  ticket.requestedEmail = ticketData.submission.requested_email;
  ticket.slack = ticketData.submission.slack;
  ticket.activeCollab = ticketData.submission.active_collab;
  ticket.freshdesk = ticketData.submission.freshdesk;

  return ticket;
}

// Puts ticket into Freshdesk format, and sends it to Freshdesk
const dispatch = (ticket) => {
  // Create new XML request with appropriate endpoint from Freshdesk
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://sachsmedia.freshdesk.com/api/v2/tickets', true);

  // Set headers. Not sure about the Authorization header?
  xhr.setRequestHeader('Content-Type', 'application/json');
  const authorize = `Basic ${Buffer.from(process.env.FRESHDESK_API_KEY + ':X').toString('base64')}`;
  xhr.setRequestHeader('Authorization', authorize);

  // Set values from Slack ticket
  const ticketBody = 'Requestor: ' + ticket.requestor + '<br>Requestor email: ' + ticket.requestorEmail + '<br>New user first name: ' + ticket.firstName + '<br>New user last name: ' + ticket.lastName + '<br>Office: <br>' + ticket.office + '<br>Requested email: ' + ticket.requestedEmail + '<br>Slack: ' + ticket.slack + '<br>Active Collab: ' + ticket.activeCollab + '<br>FreshDesk: ' + ticket.freshdesk;

  // Create JSON object with data for the Freshdesk ticket
  const payload = JSON.stringify({
    'email': ticket.userEmail,
    'subject': 'New SMG Communication Account Request',
    'description': ticketBody,
    'status': 2,
    'priority': 2,
    'source': 7,
  });

  // Send it!
  xhr.send(payload);
};

// Sends ticket confirmation to Slack #web-tickets
const confirm = (ticket) => {
  // Hard-coded channel is to #web-tickets
  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_BOT_TOKEN,
    channel: 'CGZR0K2NT',
    text: '<!channel> New SMG Communication Account ticket created!',
    attachments: JSON.stringify([
      {
        title: `Ticket created for ${ticket.userEmail}`,
        title_link: 'https://sachsmedia.freshdesk.com/a/tickets',
        text: ticket.text,
        fields: [
          {
            title: 'Requestor',
            value: ticket.requestor,
          },
          {
            title: 'Office',
            value: ticket.office,
          },
          {
            title: 'New account for',
            value: ticket.first + ' ' + ticket.last,
          },
          {
            title: 'Requested email address',
            value: ticket.requestedEmail,
          },
          {
            title: 'Slack?',
            value: ticket.slack,
          },
          {
            title: 'Active Collab?',
            value: ticket.activeCollab,
          },
          {
            title: 'FreshDesk?',
            value: ticket.freshdesk,
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
    debug('newaccount confirmation: %o', result.data);
  }).catch((err) => {
    debug('newaccount confirmation error: %o', err);
    console.error(err);
  });
};


module.exports = { build, dispatch, confirm };
