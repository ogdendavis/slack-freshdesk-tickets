// Used to identify and execute commands in incoming chat messages

const manageTIP = require('./manageTIP');

const checkForCommand = (text) => {
  // Convert chatText to lowercase and remove punctuation
  const input = text.toLowerCase().replace(/\W/g, '');
  // Check array of known commands against input
  return ['start','ticket','cancel','delete','help','silly'].includes(input) ? input : false;
}

const execute = (command, user=false) => {
  const response = { newTicket: false, message: `You did a ${command}!`, }

  switch (command) {
    case('start'):
    case('ticket'):
      response.newTicket = manageTIP.makeNewTIP(user);
      response.message = 'Ok, let\'s make a new web support ticket for you! :computer: :ticket: :sunglasses:';
      break;
    case('cancel'):
    case('delete'):
      response.message = 'Ok, I\'m deleting this ticket. :ticket: :x:\nIf you want to start another ticket, just send me another message, or use the /ticket command!';
      break;
    case('help'):
      response.message = ':wave: Hi, I\'m Rob Bot, your friendly neighborhood web help robot! :robot_face:\nI\'m here to help you make a Freshdesk ticket for web support issues.\n\nHere are the commands you can give me:\n* `ticket` - Start a ticket! :white_check_mark:\n* `cancel` - Delete the ticket currently in progress. :x:\n* `help` - See this helpful message again! :scroll:\n\nThat\'s it. Happy ticketing!';
      break;
    case('silly'):
      response.message = silliness[Math.floor(Math.random()*silliness.length)];
  }

  return response;
}

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

module.exports = { checkForCommand, execute };
