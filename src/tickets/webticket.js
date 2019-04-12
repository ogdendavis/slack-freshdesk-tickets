// Manages Freshdesk tickets for web help
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
  ticket.title = ticketData.submission.title;
  ticket.client = ticketData.submission.client;
  ticket.url = ticketData.submission.url;
  ticket.user = ticketData.submission.user;
  ticket.pass = ticketData.submission.pass;
  ticket.description = ticketData.submission.description;
  ticket.resources = ticketData.submission.resources;
  ticket.due = ticketData.submission.due;
  ticket.urgency = ticketData.submission.urgency;

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
  const priority = ticket.urgeny === 'Low' ? 1 :
                   ticket.urgency === 'High' ? 3 : 2;

  const ticketBody = 'Client: ' + ticket.client + '<br>Website: ' + ticket.url + '<br>Username: ' + ticket.user + '<br>Password: ' + ticket.pass + '<br>Description:<br>' + ticket.description + '<br>Resources: ' + ticket.resources + '<br>Requested Due Date: ' + ticket.due + '<br>Urgency: ' + ticket.urgency;

  // Create JSON object with data for the Freshdesk ticket
  const payload = JSON.stringify({
    'email': ticket.userEmail,
    'subject': `New web help ticket: ${ticket.title}`,
    'description': ticketBody,
    'status': 2,
    'priority': priority,
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
    text: '<!channel> Web help ticket created!',
    attachments: JSON.stringify([
      {
        title: `Ticket created for ${ticket.userEmail}`,
        title_link: 'https://sachsmedia.freshdesk.com/a/tickets',
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
    debug('webticket confirmation: %o', result.data);
  }).catch((err) => {
    debug('webticket confirmation error: %o', err);
    console.error(err);
  });
};


module.exports = { build, dispatch, confirm };
