require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const ticket = require('./ticket');
const signature = require('./verifySignature');
const debug = require('debug')('slash-command-template:index');
const chat = require('./chat/index');
const command = require('./commands/index');

const app = express();

/*
 * Parse application/x-www-form-urlencoded && application/json
 * Use body-parser's `verify` callback to export a parsed raw body
 * that you need to use to verify the signature
 */

const rawBodyBuffer = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};

app.use(bodyParser.urlencoded({verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));

app.get('/', (req, res) => {
  res.send('<h2>The Slash Command and Dialog app is running</h2> <p>Follow the' +
  ' instructions in the README to configure the Slack App and your environment variables.</p>');
});

/*
 * Endpoint to receive /helpdesk slash command from Slack.
 * Checks verification token and opens a dialog to capture more info.
 */
app.post('/command', (req, res) => {
  // Verify the signing secret
  if (signature.isVerified(req)) {
    // extract needed info from payload
    const { user_id, trigger_id } = req.body;
    const command_text = req.body.command;
    const desc_text = req.body.text;
    command.execute(command_text, desc_text, trigger_id, user_id, res);
  } else {
    debug('Verification token mismatch');
    res.sendStatus(404);
  }
});

/*
 * Endpoint to receive the dialog submission. Checks the verification token
 * and creates a Helpdesk ticket
 */
app.post('/interactive', (req, res) => {
  const body = JSON.parse(req.body.payload);

  // check that the verification token matches expected value
  if (signature.isVerified(req)) {
    debug(`Form submission received: ${body.submission.trigger_id}`);

    // immediately respond with a empty 200 response to let
    // Slack know the command was received
    res.send('');

    // create Helpdesk ticket
    ticket.create(body.user.id, body.callback_id, body.submission);
  } else {
    debug('Token mismatch');
    res.sendStatus(404);
  }
});

// Endpoint to receive chat messages
// Receives chats and send responses, creates Helpdesk ticket when done
app.post('/chat', (req, res) => {
  // Test for auth token (not super-sercure, but better than nothing)
  if (req.body.token !== process.env.SLACK_LEGACY_TOKEN) {
    res.sendStatus(403);
    return;
  }
  // Immediately send 200 response
  const response = req.body.type === 'url_verification' ? req.body.challenge : '';
  res.send(response);

  // Send the chat message to be interpreted
  if (req.body.hasOwnProperty('event')) {
    chat.read(req.body.event);
  }
});

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});
