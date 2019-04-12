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
      title: 'New Communications Acct',
      callback_id: 'newaccount',
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
          label: 'Which office?',
          type: 'select',
          name: 'office',
          hint: 'Where will this person\'s home office be?',
          options: [
            { label: 'Tallahassee', value: 'Tallahassee', },
            { label: 'Orlando', value: 'Orlando', },
            { label: 'Remote', value: 'Remote', },
          ],
        },
        {
          label: 'First Name',
          type: 'text',
          name: 'first',
        },
        {
          label: 'Last Name',
          type: 'text',
          name: 'last',
        },
        {
          label: 'Requested Email',
          type: 'text',
          subtype: 'email',
          name: 'description',
          hint: 'What is the preferred email address for this person? Generally, full-time staff are [first]@smg and interns/part-time are [firstinitial][last]@smg',
        },
        {
          label: 'Slack',
          type: 'select',
          name: 'slack',
          hint: 'Does this person need a Slack account?',
          value: 'true',
          options: [
            { label: 'Yes', value: 'true', },
            { label: 'No', value: 'false', },
          ],
        },
        {
          label: 'Active Collab',
          type: 'select',
          name: 'active_collab',
          hint: 'Does this person need to be added to Active Collab?',
          value: 'false',
          options: [
            { label: 'Yes', value: 'true', },
            { label: 'No', value: 'false', },
          ],
        },
        {
          label: 'FreshDesk',
          type: 'select',
          name: 'freshdesk',
          hint: 'Does this person need to be added to FreshDesk?',
          value: 'false',
          options: [
            { label: 'Yes', value: 'true', },
            { label: 'No', value: 'false', },
          ],
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
