// Creates tickets for Pre-Travel Reports
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
  ticket.client = ticketData.submission.client;
  ticket.staff = ticketData.submission.staff;
  ticket.expensesCovered = ticketData.submission.expenses_covered;
  ticket.dates = ticketData.submission.dates;
  ticket.transportation = ticketData.submission.transportation;
  ticket.lodging = ticketData.submission.lodging;
  ticket.food = ticketData.submission.food;
  ticket.misc = ticketData.submission.misc;
  ticket.totalExpense = ticketData.submission.total_expense;
  ticket.notes = ticketData.submission.notes;

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
  const ticketBody = 'Requestor email: ' + ticket.userEmail + '<br>Client: ' + ticket.client + '<br>Staff: ' + ticket.staff + '<br>Expenses covered by client? ' + ticket.expensesCovered + '<br>Trip dates: ' + ticket.dates + '<br>Estimated Expense:<ul><li>Transportation: ' + ticket.transportation + '</li><li>Lodging: ' + ticket.lodging + '</li><li>Meals: ' + ticket.food + '</li><li>Miscellaneous: ' + ticket.misc + '</li><li><strong>Total: ' + ticket.totalExpense + '</strong></li></ul>' + 'Notes: ' + ticket.notes;

  // Create JSON object with data for the Freshdesk ticket
  const payload = JSON.stringify({
    'email': ticket.userEmail,
    'subject': 'New Pre-Travel Report',
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
    text: '<!channel> New Pre-Travel Report ticket created!',
    attachments: JSON.stringify([
      {
        title: `Ticket created for ${ticket.userEmail}`,
        title_link: 'https://sachsmedia.freshdesk.com/a/tickets',
        text: ticket.text,
        fields: [
          {
            title: 'Client',
            value: ticket.client,
          },
          {
            title: 'Staff',
            value: ticket.staff,
          },
          {
            title: 'Trip Dates',
            value: ticket.dates,
          },
          {
            title: 'Total Estimated Expense',
            value: ticket.totalExpense,
          },
          {
            title: 'Notes',
            value: ticket.notes,
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
