// Creates tickets for Requests for Leave
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
  ticket.leaveType = ticketData.submission.leave_type;
  ticket.leaveStart = ticketData.submission.requested_start;
  ticket.leaveEnd = ticketData.submission.requested_end;
  ticket.leaveTotal = ticketData.submission.requested_hours;
  ticket.currentLeaveBalance = ticketData.submission.current_leave_balance;
  ticket.currentSickBalance = ticketData.submission.current_sick_balance;
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
  const ticketBody = 'Requestor: ' + ticket.requestor + '<br>Requestor email: ' + ticket.requestorEmail + '<br>Leave Type: ' + ticket.leaveType + '<br>Requested Start: ' + ticket.leaveStart + '<br>Requested End: ' + ticket.leaveEnd + '<br>Total Hours Requested: ' + ticket.leaveTotal + '<br>Current Annual/Personal Leave Balance: ' + ticket.currentLeaveBalance + '<br>Current Sick Balance: ' + ticket.currentSickBalance + '<br>Notes: ' + ticket.notes;

  // Create JSON object with data for the Freshdesk ticket
  const payload = JSON.stringify({
    'email': ticket.userEmail,
    'subject': 'New Request for Leave',
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
    text: '<!channel> New Request for Leave ticket created!',
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
            title: 'Type of Leave',
            value: ticket.leaveType,
          },
          {
            title: 'Requested Start',
            value: ticket.leaveStart,
          },
          {
            title: 'Requested End',
            value: ticket.leaveEnd,
          },
          {
            title: 'Total Hours Requested',
            value: ticket.leaveTotal,
          },
          {
            title: 'Current Annual/Personal Balance',
            value: ticket.currentLeaveBalance,
          },
          {
            title: 'Current Sick Balance',
            value: ticket.currentSickBalance,
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
