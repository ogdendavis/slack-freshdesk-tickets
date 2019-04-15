// Manages /newaccount command
const axios = require('axios');
const qs = require('querystring');
const debug = require('debug');

const execute = (trigger_id) => {
  // create the dialog payload - includes the dialog structure, Slack API token,
  // and trigger ID
  const dialog = {
    token: process.env.SLACK_OAUTH_TOKEN,
    trigger_id,
    dialog: JSON.stringify({
      title: 'Request for Leave',
      callback_id: 'vacay',
      submit_label: 'Submit',
      elements: [
        {
          label: 'Requestor Name',
          type: 'text',
          name: 'requestor',
        },
        {
          label: 'Requestor Email',
          type: 'text',
          subtype: 'email',
          name: 'requestor_email',
        },
        {
          label: 'What type of leave are you requesting?',
          type: 'select',
          name: 'leave_type',
          options: [
            { label: 'Annual Leave', value: 'annual', },
            { label: 'Sick Leave', value: 'sick', },
            { label: 'Personal Day', value: 'personal', },
          ],
        },
        {
          label: 'Leave Start',
          type: 'text',
          name: 'requested_start',
          hint: 'Requested date and time that leave begins.',
        },
        {
          label: 'Leave End',
          type: 'text',
          name: 'requested_end',
          hint: 'Requested date and time that leave ends.',
        },
        {
          label: 'Total Hours',
          type: 'text',
          name: 'requested_hours',
          hint: 'The total number of leave hours in this request',
        },
        {
          label: 'Notes',
          type: 'textarea',
          name: 'notes',
          hint: 'Please provide any additional context or information needed for this request',
        },
        {
          label: 'Current Leave Balance',
          type: 'text',
          name: 'current_leave_balance',
          hint: 'Balance of Annual Leave and One Personal Day BEFORE this request',
        },
        {
          label: 'Current Sick Balance',
          type: 'text',
          name: 'current_sick_balance',
          hint: 'Balance of Annual Sick Leave BEFORE this request',
        },
      ],
    }),
  };

  // open the dialog by calling dialogs.open method and sending the payload
  try {
    axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
      .then((result) => {
        debug('dialog.open: %o', result.data);
      }).catch((err) => {
        debug('dialog.open call failed: %o', err);
      });
    return true;
  }
  catch {
    return false;
  }
}

module.exports = { execute };
