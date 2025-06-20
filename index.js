const mineflayer = require("mineflayer");
const http = require("http");
const { chromium } = require("playwright");

// Serwer HTTP, aby UptimeRobot mógł pingować
http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bot działa!");
  })
  .listen(process.env.PORT || 3000);

console.log("Serwer HTTP działa, port:", process.env.PORT || 3000);

// === FUNKCJA STARTUJĄCA SERWER ATERNOS ===
async function startAternosServer() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto("https://aternos.org/go/", { waitUntil: "load" });

    // Logowanie do konta
    await page.goto("https://aternos.org/accounts/", { waitUntil: "load" });
    await page.fill("#user", process.env.USERNAME);
    await page.fill("#password", process.env.PASSWORD);
    await page.click("#login-form > button");
    await page.waitForLoadState("load");

    // Przejście do panelu serwera
    await page.goto("https://aternos.org/server/", { waitUntil: "load" });

    // Kliknięcie przycisku "Start"
    const startButton = await page.$("button.start");
    if (startButton) {
      console.log("🟢 Klikam przycisk START!");
      await startButton.click();
    } else {
      console.log("✅ Serwer już działa lub nie znaleziono przycisku start.");
    }

    await browser.close();
  } catch (error) {
    console.error("❌ Błąd przy starcie serwera:", error.message);
    await browser.close();
  }
}

// === FUNKCJA TWORZĄCA BOTA MINEFLAYER ===
function createBot() {
  const bot = mineflayer.createBot({
    host: "plcraftopia.aternos.me",
    port: 34736,
    username: "24_7_Bot",
    version: "1.21.4",
    auth: "offline",
  });

  bot.on("login", () => {
    console.log("✅ Bot zalogowany jako:", bot.username);
  });

  bot.on("spawn", () => {
    console.log("🟢 Bot pojawił się na serwerze!");

    function randomMove() {
      const directions = ["forward", "back", "left", "right"];
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const duration = 2000 + Math.floor(Math.random() * 3000);

      bot.setControlState(direction, true);
      if (Math.random() < 0.3) bot.setControlState("jump", true);

      setTimeout(() => {
        bot.setControlState(direction, false);
        bot.setControlState("jump", false);

        setTimeout(randomMove, 1000);
      }, duration);
    }

    randomMove();
  });

  bot.on("error", (err) => {
    console.log("❌ Błąd:", err.message);
  });

  bot.on("end", async () => {
    console.log("🔴 Bot rozłączony! Spróbuję uruchomić serwer Aternos...");
    await startAternosServer();
    console.log("🕒 Czekam 30 sekund i tworzę nowego bota...");
    setTimeout(createBot, 30000);
  });

  return bot;
}

createBot();
