const pool = require("../database");

async function createMessage(account_id, message_text) {
  const sql = "INSERT INTO messages (account_id, message_text) VALUES ($1, $2)";
  return pool.query(sql, [account_id, message_text]);
}

async function getMessagesByAccount(account_id) {
  const sql = "SELECT * FROM messages WHERE account_id = $1 ORDER BY created_at DESC";
  const result = await pool.query(sql, [account_id]);
  return result.rows;
}

module.exports = { createMessage, getMessagesByAccount };