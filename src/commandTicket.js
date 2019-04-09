// Handles /ticket command
const axios = require('axios');
const qs = require('querystring');
const debug = require('debug')('slash-command-template:commandTicket');

const execute = (text, trigger_id, res) => {
  // create the dialog payload - includes the dialog structure, Slack API token,
  // and trigger ID
  const dialog = {
    token: process.env.SLACK_OAUTH_TOKEN,
    trigger_id,
    dialog: JSON.stringify({
      title: 'Submit a helpdesk ticket',
      callback_id: 'submit-ticket',
      submit_label: 'Submit',
      elements: [
        {
          label: 'Title',
          type: 'text',
          name: 'title',
          value: text,
        },
        {
          label: 'Client',
          type: 'text',
          name: 'client',
        },
        {
          label: 'Website',
          type: 'text',
          subtype: 'url',
          name: 'url',
          hint: 'The URL at which something needs to be done',
        },
        {
          label: 'Website username',
          type: 'text',
          name: 'user',
        },
        {
          label: 'Website password',
          type: 'text',
          name: 'pass',
        },
        {
          label: 'Description',
          type: 'textarea',
          name: 'description',
        },
        {
          label: 'Resources',
          type: 'text',
          subtype: 'url',
          name: 'resources',
          hint: 'Link to Google Drive folder which contains any resources needed to complete the task',
        },
        {
          label: 'Requested completion date',
          type: 'text',
          name: 'due',
        },
        {
          label: 'Urgency',
          type: 'select',
          name: 'urgency',
          options: [
            { label: 'Low', value: 'Low' },
            { label: 'Medium', value: 'Medium' },
            { label: 'High', value: 'High' },
          ],
        },
      ],
    }),
  };

  // open the dialog by calling dialogs.open method and sending the payload
  axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
    .then((result) => {
      debug('dialog.open: %o', result.data);
      res.send('');
    }).catch((err) => {
      debug('dialog.open call failed: %o', err);
      res.sendStatus(500);
    });
}

module.exports = { execute };
