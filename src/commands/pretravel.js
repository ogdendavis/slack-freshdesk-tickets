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
      title: 'Pre-Travel Report',
      callback_id: 'pretravel',
      submit_label: 'Submit',
      elements: [
        {
          label: 'Client Name',
          type: 'text',
          name: 'client',
        },
        {
          label: 'SMG Staff',
          type: 'text',
          name: 'staff',
          hint: 'Please list all SMG staff going on the trip (including yourself)',
        },
        {
          label: 'Are travel expenses covered by the client?',
          type: 'select',
          name: 'expenses_covered',
          value: 'no',
          options: [
            { label: 'Yes', value: 'yes', },
            { label: 'No', value: 'no', },
          ],
        },
        {
          label: 'Travel Dates',
          type: 'text',
          name: 'dates',
          hint: 'Start and end dates of the trip',
        },
        {
          label: 'Transportation Type(s) & Estimated Cost',
          type: 'text',
          name: 'transportation',
          hint: 'Mileage is billed to the client at $0.545 per mile, and reimbursed to staff at $0.445 per mile'
        },
        {
          label: 'Lodging: Name of Hotel & Estimated Cost',
          type: 'text',
          name: 'lodging',
        },
        {
          label: 'Meals: Number & Estimated Cost',
          type: 'text',
          name: 'food',
        },
        {
          label: 'Misc. Expenses & Estimated Cost',
          type: 'text',
          name: 'misc',
          hint: 'Please include information on what miscellaneous costs will be',
        },
        {
          label: 'Total Estimated Travel Expense',
          type: 'text',
          name: 'total_expense',
          hint: 'Should be the sum of the costs above',
        },
        {
          label: 'Notes',
          type: 'textarea',
          name: 'notes',

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
