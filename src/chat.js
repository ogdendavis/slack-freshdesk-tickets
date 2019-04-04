const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const users = require('./users');
const chatTIP = require('./chatTIP');
const chatCommand = require('./chatCommand');
const chatValidate = require('./chatValidate');

// Object to hold in-progress tickets -- managed by chatHandler & chatTIP methods
const ticketsInProgress = {};

// Export function -- reads chat messages and sends them to the handler
const read = (chatEvent) => {
  // If it's a bot message or NOT a direct message, ignore it! This avoids infinite loops
  if (chatEvent.subtype === 'bot_message' || chatEvent.channel_type !== 'im') {
    return;
  }

  // Gather info
  const user = chatEvent.user;
  const channel = chatEvent.channel;
  const text = chatEvent.text;
  const command = chatCommand.checkForCommand(text);
  let thisTicket = ticketsInProgress[user] || false;

  if (command) {
    // response is: { newTicket: (false or object), message: (string) }
    const response = chatCommand.execute(command, user);

    switch (command) {
      case 'cancel':
      case 'delete':
        if (!thisTicket) { break; }
        delete ticketsInProgress[user];
      case 'help':
        send(channel, response.message);
        return;
      case 'silly':
        send(channel, silliness[Math.floor(Math.random()*silliness.length)]);
        return;
      case 'start':
        if (thisTicket) {
          break;
        }
        thisTicket = response.newTicket;
        send(channel, response.message);
    }
  }

  // If no ticket created, and no command input, give help message
  if (!thisTicket) {
    send(channel, chatCommand.execute('help', user).message);
    return;
  }

  chatHandler(user, channel, text, thisTicket);
}

// Helper function to send chat message
const send = (channel, message = 'I am a bot. My name is Rob.') => {
  // Create new XML request with appropriate endpoint from Slack
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://slack.com/api/chat.postMessage', true);

  // Set headers.
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.setRequestHeader('Authorization', `Bearer ${process.env.SLACK_BOT_TOKEN}`);

  // Create the response!
  const payload = JSON.stringify({
    channel: channel,
    text: message,
    as_user: false,
  });

  // Handle responses -- mainly for testing, disable in production to avoid overwhelming logs
  // xhr.onreadystatechange = function() {
  //   if (this.readyState === XMLHttpRequest.DONE && this.status === 201) {
  //     console.log('Success');
  //   }
  //   else {
  //     console.log(this.status);
  //     console.log(this.responseText);
  //   }
  // };

  // A small delay makes the chat feel less abrupt
  // setTimeout(xhr.send, 150, payload);
  xhr.send(payload);
}

// Main function -- updates ticketsInProgress with incoming info until ready to send
const chatHandler = (user, channel, text, thisTicket) => {
  // Early return if response is invalid
  if (!chatValidate.isValid(text, thisTicket)) {
    send(channel, 'Invalid response. Please try again.');
    send(channel, thisTicket.questions[thisTicket.onQuestion].query);
    return;
  }

  const nextQuestion = thisTicket.onQuestion + 1;

  // The first time we get here, we need to ask the first question!
  // onQuestion is initialized as -1
  if (nextQuestion === 0) {
    setTimeout(send, 1000, channel, thisTicket.questions[nextQuestion].query);
    //send(channel, thisTicket.questions[nextQuestion].query);
    thisTicket.onQuestion++;
    ticketsInProgress[user] = thisTicket;
  }

  // Case for chats that are replies to questions
  else if (nextQuestion < thisTicket.questions.howMany) {
    // Store the answer, increment the counter, send the next question
    thisTicket.questions[thisTicket.onQuestion].reply = text;
    thisTicket.onQuestion++;
    send(channel, thisTicket.questions[thisTicket.onQuestion].query);
    // Update the ticket in progress
    ticketsInProgress[user] = thisTicket;
  }
  // Case for last question answered
  else {
    // Remember to store the last answer!
    thisTicket.questions[thisTicket.onQuestion].reply = text;
    send(channel, 'Ok, great! I should have everything I need. Your ticket has been created, and you will hear from the web team shortly. :ticket: :white_check_mark:');
    chatTIP.sendTIP(thisTicket);
    delete ticketsInProgress[user];
  }
}

module.exports = { read };

const silliness = ['Did you hear about the restaurant on the moon? Great food, no atmosphere.',
'What do you call a fake noodle? An Impasta.',
'How many apples grow on a tree? All of them.',
'Want to hear a joke about paper? Nevermind it\'s tearable.',
'I just watched a program about beavers. It was the best dam program I\'ve ever seen.',
'Why did the coffee file a police report? It got mugged.',
'How does a penguin build its house? Igloos it together.',
'Rob Bot, did you get a haircut? No I got them all cut.',
'Why did the scarecrow win an award? Because he was outstanding in his field.',
'Why don\'t skeletons ever go trick or treating? Because they have no body to go with.',
'I\'ll call you later. Don\'t call me later, call me Rob Bot',
'What do you call an elephant that doesn\'t matter? An irrelephant.',
'Want to hear a joke about construction? I\'m still working on it.',
'What do you call cheese that isn\'t yours? Nacho Cheese.',
'Why couldn\'t the bicycle stand up by itself? It was two tired.',
'What did the grape do when he got stepped on? He let out a little wine.',
'I wouldn\'t buy anything with velcro. It\'s a total rip-off.',
'The shovel was a ground-breaking invention.',
'This graveyard looks overcrowded. People must be dying to get in here.',
'5/4 of people admit that they\’re bad with fractions.',
'Two goldfish are in a tank. One says to the other, "do you know how to drive this thing?"',
'What do you call a man with a rubber toe? Roberto.',
'What do you call a fat psychic? A four-chin teller.',
'I would avoid the sushi if I was you. It’s a little fishy.',
'To the man in the wheelchair that stole my camouflage jacket... You can hide but you can\'t run.',
'The rotation of earth really makes my day.',
'I thought about going on an all-almond diet. But that\'s just nuts.',
'What\'s brown and sticky? A stick.',
'I\’ve never gone to a gun range before. I decided to give it a shot!',
'Why do you never see elephants hiding in trees? Because they\'re so good at it.',
'Did you hear about the kidnapping at school? It\'s fine, he woke up.',
'A furniture store keeps calling me. All I wanted was one night stand.',
'I used to work in a shoe recycling shop. It was sole destroying.',
'Did I tell you the time I fell in love during a backflip? I was heels over head.',
'I don’t play soccer because I enjoy the sport. I\’m just doing it for kicks.',
'People don’t like having to bend over to get their drinks. We really need to raise the bar.'];
