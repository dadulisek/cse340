const messageModel = require("../models/message-model");
const utilities = require("../utilities/")

const msgCont = {}

msgCont.sendMessage = async function(req, res) {
  const { message_text, account_id } = req.body;
  try {
    await messageModel.createMessage(account_id, message_text);
    req.flash("notice", "Message sent.");
    res.redirect("/account/");
  } catch (err) {
    req.flash("notice", "Failed to send message.");
    res.redirect("/account/");
  }
}

msgCont.viewMessages = async function(req, res) {
  let nav = await utilities.getNav()
  const account_id = res.locals.accountData.account_id;
  const messages = await messageModel.getMessagesByAccount(account_id);
  res.render("account/messages", {
    title: "My Messages",
    nav,
    messages
  });
}

module.exports = msgCont