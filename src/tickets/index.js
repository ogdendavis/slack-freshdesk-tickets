// Manage creation of different kinds of tickets
// Manage sending tickets to Freshdesk, and sending confirmation to Slack
const debug = require('debug');
const users = require('../users');

const newAccount = require('./newaccount');
const webTicket = require('./webticket');
const vacay = require('./vacay');
const preTravel = require('./pretravel')
const chat = require('../chat/index');

const buildTicket = (ticketData) => {
  switch(ticketData.type) {
    case 'webticket':
      return webTicket.build(ticketData);
    case 'newaccount':
      return newAccount.build(ticketData);
    case 'vacay':
      return vacay.build(ticketData);
    case 'pretravel':
      return preTravel.build(ticketData);
    default:
      return false;
  }
}

const createFreshdeskTicket = (ticket) => {
  switch(ticket.type) {
    case 'webticket':
      webTicket.dispatch(ticket);
      break;
    case 'newaccount':
      newAccount.dispatch(ticket);
      break;
    case 'vacay':
      vacay.dispatch(ticket);
      break;
    case 'pretravel':
      preTravel.dispatch(ticket);
      break;
    default:
      return false;
  }
}

const sendSlackConfirmation = (ticket) => {
  switch(ticket.type) {
    case 'webticket':
      webTicket.confirm(ticket);
      break;
    case 'newaccount':
      newAccount.confirm(ticket);
      break;
    case 'vacay':
      vacay.confirm(ticket);
      break;
    case 'pretravel':
      preTravel.confirm(ticket);
      break;
    default:
      return false;
  }
}

const sendUserConfirmation = (ticket) => {
  console.log(ticket);
  let prettyType = '';

  switch (ticket.type) {
    case 'webticket':
      prettyType = 'web help ticket';
      break;
    case 'newaccount':
      prettyType = 'new SMG communication account request';
      break;
    case 'vacay':
      prettyType = 'request for leave';
      break;
    case 'pretravel':
      prettyType = 'pre-travel report'
      break;
    default:
      prettyType = 'help ticket';
  }

  chat.send(ticket.userId, `Your ${prettyType} has been submitted! You should receive an email from Freshdesk confirming the ticket for this issue; if you don't see it, check your spam folder!`);
}

const create = (userId, ticketType, submission) => {

  const fetchUserEmail = new Promise((resolve, reject) => {
    users.find(userId).then((result) => {
      debug(`Find user: ${userId}`);
      resolve(result.data.user.profile.email);
    }).catch((err) => { reject(err); });
  });

  fetchUserEmail.then((result) => {
    const ticketData = {
      type: ticketType,
      userId: userId,
      userEmail: result,
      submission: submission,
    }
    const ticket = buildTicket(ticketData);

    createFreshdeskTicket(ticket);
    sendSlackConfirmation(ticket);
    sendUserConfirmation(ticket);

    return ticket;
  }).catch((err) => { console.error(err); });
};

module.exports = { create };
