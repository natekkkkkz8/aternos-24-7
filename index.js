require('dotenv').config();
const mineflayer = require('mineflayer');

function createBot() {
  const bot = mineflayer.createBot({
    host: process.env.HOST,
    port: parseInt(process.env.PORT, 10),
    username: process.env.USERNAME,
    version: process.env.VERSION
    // auth omitted, default is offline (cracked)
  });

  bot.on('login', () => {
    console.log('✅ Bot logged in as:', bot.username);
  });

  bot.on('spawn', () => {
    console.log('🟢 Bot spawned on server!');

    function randomMove() {
      const directions = ['forward', 'back', 'left', 'right'];
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const duration = 2000 + Math.floor(Math.random() * 3000);

      bot.setControlState(direction, true);
      if (Math.random() < 0.3) bot.setControlState('jump', true);

      setTimeout(() => {
        bot.setControlState(direction, false);
        bot.setControlState('jump', false);

        setTimeout(randomMove, 1000);
      }, duration);
    }

    randomMove();
  });

  bot.on('error', (err) => {
    console.log('❌ Error:', err.message);
  });

  bot.on('end', () => {
    console.log('🔴 Bot disconnected. Reconnecting in 10 seconds...');
    setTimeout(createBot, 10000);
  });

  return bot;
}

createBot();
