// Manage creation of different kinds of tickets
// Manage sending tickets to Freshdesk, and sending confirmation to Slack
const debug = require('debug');
const users = require('../users');

const newAccount = require('./newaccount');
const webTicket = require('./webticket');

const buildTicket = (ticketData) => {
  switch(ticketData.type) {
    case 'webticket':
      return webTicket.build(ticketData);
    case 'newaccount':
      break;
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
      break;
    default:
      return false;
  }
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

    return ticket;
  }).catch((err) => { console.error(err); });
};

module.exports = { create };
