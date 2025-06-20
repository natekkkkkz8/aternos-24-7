require("dotenv").config();
const mineflayer = require("mineflayer");
const http = require("http");
const puppeteer = require("puppeteer");

// Prosty serwer HTTP (np. do uptime monitoring)
http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bot działa!");
  })
  .listen(process.env.PORT || 3000);

console.log("Serwer HTTP działa, port:", process.env.PORT || 3000);

// Funkcja do uruchomienia serwera Aternos przez Puppeteer
async function startAternosServer() {
  console.log("🔄 Próba uruchomienia serwera Aternos...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  try {
    // Przejście do strony logowania
    await page.goto("https://aternos.org/accounts/", { waitUntil: "networkidle2" });
    // Logowanie
    await page.type("#user", process.env.USERNAME);
    await page.type("#password", process.env.PASSWORD);
    await page.click("#login-form > button");
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    // Przejście do panelu serwera
    await page.goto("https://aternos.org/server/", { waitUntil: "networkidle2" });

    // Kliknięcie przycisku "Start" jeśli jest dostępny
    const startButton = await page.$("button.start");
    if (startButton) {
      console.log("🟢 Klikam START serwera!");
      await startButton.click();
    } else {
      console.log("✅ Serwer jest już uruchomiony lub brak przycisku start.");
    }

    await browser.close();
  } catch (error) {
    console.error("❌ Błąd podczas uruchamiania serwera Aternos:", error.message);
    await browser.close();
  }
}

// Funkcja tworząca bota Mineflayer
function createBot() {
  const bot = mineflayer.createBot({
    host: "plcraftopia.aternos.me",  // Twój host
    port: 34736,                     // Twój port
    username: "24_7_Bot",            // Nazwa bota
    version: "1.21.4",
    auth: "offline",
  });

  bot.on("login", () => {
    console.log("✅ Bot zalogowany jako:", bot.username);
  });

  bot.on("spawn", () => {
    console.log("🟢 Bot pojawił się na serwerze!");

    // Proste losowe ruchy bota
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
    console.log("❌ Błąd bota:", err.message);
  });

  bot.on("end", async () => {
    console.log("🔴 Bot rozłączony! Próba uruchomienia serwera Aternos...");
    await startAternosServer();
    console.log("🕒 Czekam 30 sekund i tworzę nowego bota...");
    setTimeout(createBot, 30000);
  });

  return bot;
}

createBot();
