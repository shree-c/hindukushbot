require('dotenv').config();
const { Telegraf } = require('telegraf');
module.exports = new Telegraf(process.env.TELE_KEY);