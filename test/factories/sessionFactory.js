const buffer = require("safe-buffer").Buffer;
const Keygrib = require("keygrip");
const keys = require("../../config/keys");

const keygrip = new Keygrib([keys.cookieKey]);

module.exports = (user) => {
  const sessionObject = {
    passport: {
      user: user._id.toString(),
    },
  };

  const session = buffer.from(JSON.stringify(sessionObject)).toString("base64");

  const sig = keygrip.sign("session=" + session);

  return { session, sig };
};
