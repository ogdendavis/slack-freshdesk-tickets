// Used to validate responses to ticket questions

const isValid = (text, ticket) => {
  // If we haven't asked a question, no need to validate!
  if (ticket.onQuestion < 0) {
    return true;
  }

  switch (ticket.onQuestion) {
    case 1: // One-sentence overview
      return sentenceCheck(text);
    case 2: // website URL
      return urlCheck(text);
    case 3: // website login
    case 4: // website password
      return credentialCheck(text);
    case 5: // long description
    case 6: // resource location (not necessarily url)
    case 7: // due dates
    case 0: // client
    default:
      return true;
  }
}

const urlCheck = (slackifiedText) => {
  // Slack reformats message input that it recognizes as urls
  // If starts with protocol: 'http://google.com' => '<http://google.com>'
  // If no protocol: 'google.com' => '<http://google.com|google.com>'
  // Piggyback this behavior to validate URLs!
  return /^<http[A-Za-z0-9.\/|:]*>$/.test(slackifiedText);
}

const sentenceCheck = (sentence) => {
  // Just making sure that 'one-sentence' entries aren't too long
  return sentence.length < 100;
}

const credentialCheck = (credential) => {
  // Checks that a login or password entry looks like a login or password
  return !credential.includes(' ');
}


module.exports = { isValid };
