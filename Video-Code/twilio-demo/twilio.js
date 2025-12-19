const twilio = require("twilio");

const accountSid = 'your account sid'
const authToken = 'your auth token'
const client = twilio(accountSid, authToken);

async function createMessage() {
  const message = await client.messages.create({
    body: "new message",
    from: "+1 your from number",
    to: "+1 your two number",
  });

  console.log(message.body);
}

createMessage();