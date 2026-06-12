import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  app.set("trust proxy", true);
  const PORT = 3000;

  app.use(express.json());

  const DATA_DIR = path.join(process.cwd(), "data");
  const CONTENT_FILE = path.join(DATA_DIR, "content.json");
  const RSVP_FILE = path.join(DATA_DIR, "rsvp.json");
  const ADMIN_FILE = path.join(DATA_DIR, "admin.json");

  // Helper for admin verification
  const verifyAdminToken = (req: any) => {
    const authHeader = req.headers.authorization;
    if (authHeader === "Bearer denis_wedding_admin_secure_token_2026") {
      return true;
    }
    return false;
  };

  // Helper to get Yandex config (stored settings or .env fallback)
  const getYandexConfig = () => {
    let clientId = process.env.YANDEX_CLIENT_ID || "f0e504521c4d499bb9289b83c7079ba1";
    let clientSecret = process.env.YANDEX_CLIENT_SECRET || "e8b24a174195469ab278d96e4acca372";
    try {
      if (fs.existsSync(ADMIN_FILE)) {
        const adminData = JSON.parse(fs.readFileSync(ADMIN_FILE, "utf-8"));
        if (adminData.yandexConfig) {
          if (adminData.yandexConfig.clientId) clientId = adminData.yandexConfig.clientId;
          if (adminData.yandexConfig.clientSecret) clientSecret = adminData.yandexConfig.clientSecret;
        }
      }
    } catch (err) {
      console.error("Failed to read yandexConfig from admin file", err);
    }
    return { clientId, clientSecret };
  };

  // Helper to get Telegram config (stored settings or .env fallback)
  const getTelegramConfig = () => {
    let botToken = process.env.TELEGRAM_BOT_TOKEN || "";
    let chatId = process.env.TELEGRAM_CHAT_ID || "";
    try {
      if (fs.existsSync(ADMIN_FILE)) {
        const adminData = JSON.parse(fs.readFileSync(ADMIN_FILE, "utf-8"));
        if (adminData.telegramConfig) {
          if (adminData.telegramConfig.botToken) botToken = adminData.telegramConfig.botToken;
          if (adminData.telegramConfig.chatId) chatId = adminData.telegramConfig.chatId;
        }
      }
    } catch (err) {
      console.error("Failed to read telegramConfig from admin file", err);
    }
    return { botToken, chatId };
  };

  // Helper to send Telegram Notification for a new RSVP
  const sendRsvpTelegramNotification = async (rsvp: any) => {
    const { botToken, chatId } = getTelegramConfig();
    if (!botToken || !chatId) {
      console.log("Telegram notification skipped: Bot Token or Chat ID not configured");
      return;
    }

    const isAttending = rsvp.attending === "yes";
    const statusText = isAttending ? "Прибыл(а) на торжество" : "К сожалению, не прибудет";
    
    let text = `<b>Новое подтверждение присутствия!</b>\n\n`;
    text += `<b>Имя:</b> ${rsvp.name}\n`;
    text += `<b>Статус:</b> ${statusText}\n`;
    
    if (isAttending) {
      text += `<b>Количество гостей:</b> ${rsvp.guests || 1}\n`;
      if (rsvp.guest2Name && rsvp.guest2Name.trim()) {
        text += `<b>Спутник:</b> ${rsvp.guest2Name}\n`;
      }
    }

    if (rsvp.message && rsvp.message.trim()) {
      text += `<b>Пожелания / Сообщение:</b>\n<i>${rsvp.message.trim()}</i>\n`;
    }

    if (rsvp.yandexLogin) {
      text += `\n<i>Авторизован через Яндекс: ${rsvp.yandexLogin}</i>`;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "HTML"
        })
      });
      const result = await response.json();
      console.log("Telegram RSVP notification response:", result);
    } catch (err) {
      console.error("Failed to send Telegram RSVP notification", err);
    }
  };

  // Helper to construct app URL robustly
  const getAppUrl = (req: any) => {
    let appUrl = (req.query.origin as string) || process.env.APP_URL;

    if (!appUrl) {
      // 1. Check standard proxy/forwarding headers
      const forwardedProto = req.get('x-forwarded-proto');
      const forwardedHost = req.get('x-forwarded-host');
      if (forwardedProto && forwardedHost) {
        appUrl = `${forwardedProto}://${forwardedHost}`;
      } else {
        // 2. Fallback to host header
        const host = req.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
        appUrl = `${protocol}://${host}`;
      }
    }

    if (!appUrl.startsWith('http')) {
      appUrl = `https://${appUrl}`;
    }

    let cleanAppUrl = appUrl.replace(/\/+$/, "");
    if (cleanAppUrl.includes('.containerapps.ru') || cleanAppUrl.includes('.cloud.ru')) {
      // Strip port 3000 if it leaked through from backend to a public cloud.ru URL
      cleanAppUrl = cleanAppUrl.replace(/:3000\b/, "");
    }

    return cleanAppUrl;
  };

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (err) {
      console.error("Failed to create data directory", err);
    }
  }

  const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
  if (!fs.existsSync(UPLOADS_DIR)) {
    try {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    } catch (err) {
      console.error("Failed to create uploads directory", err);
    }
  }

  // Serve uploads statically
  app.use("/uploads", express.static(UPLOADS_DIR));

  // Ensure admin configuration exists
  if (!fs.existsSync(ADMIN_FILE)) {
    try {
      fs.writeFileSync(ADMIN_FILE, JSON.stringify({
        linkedYandexUsers: []
      }, null, 2));
    } catch (err) {
      console.error("Failed to create admin file", err);
    }
  }

  // API routes
  app.get("/api/content", (req, res) => {
    if (fs.existsSync(CONTENT_FILE)) {
      try {
        const data = fs.readFileSync(CONTENT_FILE, "utf-8");
        res.json(JSON.parse(data));
      } catch (err) {
        res.status(500).json({ error: "Failed to read content" });
      }
    } else {
      res.json(null);
    }
  });

  app.post("/api/content", (req, res) => {
    if (!verifyAdminToken(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      fs.writeFileSync(CONTENT_FILE, JSON.stringify(req.body, null, 2));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to save content" });
    }
  });

  app.get("/api/rsvp", (req, res) => {
    if (!verifyAdminToken(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (fs.existsSync(RSVP_FILE)) {
      try {
        const data = fs.readFileSync(RSVP_FILE, "utf-8");
        res.json(JSON.parse(data));
      } catch (err) {
        res.status(500).json({ error: "Failed to read rsvps" });
      }
    } else {
      res.json([]);
    }
  });

  app.post("/api/rsvp", (req, res) => {
    try {
      let rsvps = [];
      if (fs.existsSync(RSVP_FILE)) {
        rsvps = JSON.parse(fs.readFileSync(RSVP_FILE, "utf-8"));
      }
      
      const newRsvp = {
        ...req.body,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      
      // Upsert by yandex id if exists
      if (req.body.yandexId) {
        const index = rsvps.findIndex((r: any) => r.yandexId === req.body.yandexId);
        if (index !== -1) {
          rsvps[index] = { ...rsvps[index], ...newRsvp };
        } else {
          rsvps.push(newRsvp);
        }
      } else {
        rsvps.push(newRsvp);
      }

      fs.writeFileSync(RSVP_FILE, JSON.stringify(rsvps, null, 2));

      // Send Telegram notification in background
      sendRsvpTelegramNotification(newRsvp).catch(err => {
        console.error("Failed to send background Telegram notification:", err);
      });

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to save rsvp" });
    }
  });

  // DELETE single RSVP by ID (requires admin)
  app.delete("/api/rsvp/:id", (req, res) => {
    if (!verifyAdminToken(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { id } = req.params;
    try {
      if (fs.existsSync(RSVP_FILE)) {
        let rsvps = JSON.parse(fs.readFileSync(RSVP_FILE, "utf-8"));
        const initialLen = rsvps.length;
        rsvps = rsvps.filter((r: any) => String(r.id) !== String(id));
        fs.writeFileSync(RSVP_FILE, JSON.stringify(rsvps, null, 2));
        res.json({ success: true, count: rsvps.length, deleted: initialLen !== rsvps.length });
      } else {
        res.json({ success: true, count: 0, deleted: false });
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to delete rsvp" });
    }
  });

  // POST admin login via login & password
  app.post("/api/admin/login", (req, res) => {
    const { login, password } = req.body;
    if (login === "denis" && password === "335464542Ltybc") {
      res.json({ 
        success: true, 
        token: "denis_wedding_admin_secure_token_2026" 
      });
    } else {
      res.status(401).json({ success: false, error: "Неверный логин или пароль" });
    }
  });

  // POST check if Yandex ID is linked to admin access
  app.post("/api/admin/check-yandex", (req, res) => {
    const { yandexId, email } = req.body;
    
    // Hardcoded failsafes requested earlier
    const hardcodedAdmins = ["d.kheruvimov@ya.ru", "d.kheruvimov@gmail.com", "rusillusion@gmail.com"];
    const normalizedEmail = email ? email.toLowerCase().trim().replace("@yandex.ru", "@ya.ru") : "";
    
    if (hardcodedAdmins.includes(normalizedEmail)) {
      return res.json({ 
        success: true, 
        isAdmin: true, 
        token: "denis_wedding_admin_secure_token_2026" 
      });
    }

    try {
      if (fs.existsSync(ADMIN_FILE)) {
        const adminData = JSON.parse(fs.readFileSync(ADMIN_FILE, "utf-8"));
        const linkedUsers = adminData.linkedYandexUsers || [];
        const isLinked = linkedUsers.some((u: any) => String(u.yandexId) === String(yandexId));
        if (isLinked) {
          return res.json({ 
            success: true, 
            isAdmin: true, 
            token: "denis_wedding_admin_secure_token_2026" 
          });
        }
      }
    } catch (err) {
      console.error("Failed to check linked Yandex ID", err);
    }

    res.json({ success: true, isAdmin: false });
  });

  // GET linked Yandex users (requires token)
  app.get("/api/admin/linked-yandex", (req, res) => {
    if (!verifyAdminToken(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      if (fs.existsSync(ADMIN_FILE)) {
        const adminData = JSON.parse(fs.readFileSync(ADMIN_FILE, "utf-8"));
        res.json(adminData.linkedYandexUsers || []);
      } else {
        res.json([]);
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to read linked accounts" });
    }
  });

  // POST link Yandex user (requires token)
  app.post("/api/admin/link", (req, res) => {
    if (!verifyAdminToken(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { yandexId, login, realName, avatarUrl } = req.body;
    if (!yandexId) {
      return res.status(400).json({ error: "Missing yandexId" });
    }

    try {
      let adminData = { linkedYandexUsers: [] };
      if (fs.existsSync(ADMIN_FILE)) {
        adminData = JSON.parse(fs.readFileSync(ADMIN_FILE, "utf-8"));
      }

      const linkedUsers = adminData.linkedYandexUsers || [];
      const exists = linkedUsers.some((u: any) => String(u.yandexId) === String(yandexId));

      if (!exists) {
        linkedUsers.push({
          yandexId: String(yandexId),
          login,
          realName,
          avatarUrl,
          linkedAt: new Date().toISOString()
        });
        adminData.linkedYandexUsers = linkedUsers;
        fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminData, null, 2));
      }

      res.json({ success: true, linkedUsers });
    } catch (err) {
      res.status(500).json({ error: "Failed to link account" });
    }
  });

  // POST unlink Yandex user (requires token)
  app.post("/api/admin/unlink", (req, res) => {
    if (!verifyAdminToken(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { yandexId } = req.body;
    if (!yandexId) {
      return res.status(400).json({ error: "Missing yandexId" });
    }

    try {
      if (fs.existsSync(ADMIN_FILE)) {
        const adminData = JSON.parse(fs.readFileSync(ADMIN_FILE, "utf-8"));
        const linkedUsers = adminData.linkedYandexUsers || [];
        adminData.linkedYandexUsers = linkedUsers.filter((u: any) => String(u.yandexId) !== String(yandexId));
        fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminData, null, 2));
        res.json({ success: true, linkedUsers: adminData.linkedYandexUsers });
      } else {
        res.json({ success: true, linkedUsers: [] });
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to unlink account" });
    }
  });

  // POST local binary image upload (requires admin token)
  app.post("/api/upload", express.raw({ type: "image/*", limit: "15mb" }), (req, res) => {
    if (!verifyAdminToken(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const contentType = req.headers["content-type"] || "image/jpeg";
    let ext = "jpg";
    if (contentType.includes("png")) ext = "png";
    else if (contentType.includes("gif")) ext = "gif";
    else if (contentType.includes("webp")) ext = "webp";
    else if (contentType.includes("svg")) ext = "svg";

    const fileName = `upload_${Date.now()}.${ext}`;
    const filePath = path.join(DATA_DIR, "uploads", fileName);

    try {
      fs.writeFileSync(filePath, req.body);
      res.json({ success: true, url: `/uploads/${fileName}` });
    } catch (err) {
      console.error("Upload failed", err);
      res.status(500).json({ error: "Failed to save file" });
    }
  });

  // GET list of all uploaded media files (requires admin token)
  app.get("/api/uploads", (req, res) => {
    if (!verifyAdminToken(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      if (fs.existsSync(UPLOADS_DIR)) {
        const files = fs.readdirSync(UPLOADS_DIR);
        const result = files.map(file => {
          const filePath = path.join(UPLOADS_DIR, file);
          const stat = fs.statSync(filePath);
          return {
            name: file,
            url: `/uploads/${file}`,
            size: stat.size,
            mtime: stat.mtime.toISOString()
          };
        });
        // Sort by most recently modified
        result.sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());
        res.json(result);
      } else {
        res.json([]);
      }
    } catch (err) {
      console.error("Failed to read uploads directory", err);
      res.status(500).json({ error: "Failed to read uploads list" });
    }
  });

  // DELETE uploaded media file by name (requires admin token)
  app.delete("/api/uploads/:name", (req, res) => {
    if (!verifyAdminToken(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { name } = req.params;
    const sanitizedName = path.basename(name);
    const filePath = path.join(UPLOADS_DIR, sanitizedName);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "File not found" });
      }
    } catch (err) {
      console.error("Failed to delete file", err);
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // GET admin Yandex config
  app.get("/api/admin/yandex-config", (req, res) => {
    if (!verifyAdminToken(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const config = getYandexConfig();
    res.json(config);
  });

  // POST admin Yandex config
  app.post("/api/admin/yandex-config", (req, res) => {
    if (!verifyAdminToken(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { clientId, clientSecret } = req.body;
    try {
      let adminData: any = { linkedYandexUsers: [] };
      if (fs.existsSync(ADMIN_FILE)) {
        adminData = JSON.parse(fs.readFileSync(ADMIN_FILE, "utf-8"));
      }
      adminData.yandexConfig = {
        clientId: clientId || "",
        clientSecret: clientSecret || ""
      };
      fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminData, null, 2));
      res.json({ success: true, config: adminData.yandexConfig });
    } catch (err) {
      res.status(500).json({ error: "Failed to save Yandex config" });
    }
  });

  // GET admin Telegram config
  app.get("/api/admin/telegram-config", (req, res) => {
    if (!verifyAdminToken(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.json(getTelegramConfig());
  });

  // POST admin Telegram config
  app.post("/api/admin/telegram-config", async (req, res) => {
    if (!verifyAdminToken(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { botToken, chatId } = req.body;
    try {
      let adminData: any = { linkedYandexUsers: [] };
      if (fs.existsSync(ADMIN_FILE)) {
        adminData = JSON.parse(fs.readFileSync(ADMIN_FILE, "utf-8"));
      }
      adminData.telegramConfig = {
        botToken: botToken || "",
        chatId: chatId || ""
      };
      fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminData, null, 2));

      // Auto-register webhook with Telegram if token is provided
      if (botToken) {
        const cleanAppUrl = getAppUrl(req);
        const webhookUrl = `${cleanAppUrl}/api/telegram-webhook`;
        console.log(`Setting Telegram web hook: ${webhookUrl}`);
        try {
          const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
            method: 'POST',
            sub_method: 'JSON',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: webhookUrl })
          } as any);
          const result = await response.json();
          console.log("Telegram webhook registration result:", result);
        } catch (webhookErr) {
          console.error("Failed to set Telegram webhook:", webhookErr);
        }
      }

      res.json({ success: true, config: adminData.telegramConfig });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save Telegram config" });
    }
  });

  // Telegram Bot Webhook
  app.post("/api/telegram-webhook", async (req, res) => {
    // Reply immediately to Telegram to prevent retry loops
    res.sendStatus(200);

    const update = req.body;
    if (!update || !update.message) return;

    const message = update.message;
    const text = message.text ? message.text.trim() : "";
    const chatIdOnMessage = message.chat?.id;

    if (!text) return;

    const { botToken, chatId: configChatId } = getTelegramConfig();
    if (!botToken) return;

    const sendTelegramMessage = async (targetChatId: string | number, htmlText: string) => {
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: targetChatId,
            text: htmlText,
            parse_mode: "HTML"
          })
        });
      } catch (err) {
        console.error("Failed to send Telegram message", err);
      }
    };

    // 1. /chatid command (useful to discover chat ID, works anywhere)
    if (text.startsWith("/chatid")) {
      const respText = `ID этого чата: <code>${chatIdOnMessage}</code>\nУкажите его в панели управления интеграциями усадьбы.`;
      await sendTelegramMessage(chatIdOnMessage, respText);
      return;
    }

    // 2. /start command
    if (text.startsWith("/start")) {
      const respText = `Приветствую! Я бот усадьбы.\nID этого чата: <code>${chatIdOnMessage}</code>\nБуду присылать уведомления о новых гостях сюда.\n\nВведите /guests в настроенном чате, чтобы получить список гостей.`;
      await sendTelegramMessage(chatIdOnMessage, respText);
      return;
    }

    // 3. /guests command (restricted to configured chat only)
    const normalizedConfigChatId = String(configChatId).trim();
    const normalizedChatIdOnMessage = String(chatIdOnMessage).trim();
    const isAuthorized = normalizedConfigChatId && (normalizedChatIdOnMessage === normalizedConfigChatId);

    if (text.startsWith("/guests") || text.split("@")[0] === "/guests") {
      if (!isAuthorized) {
        await sendTelegramMessage(chatIdOnMessage, "Доступ ограничен. Запросы разрешены только из настроенного чата управления.");
        return;
      }

      try {
        let rsvps = [];
        if (fs.existsSync(RSVP_FILE)) {
          rsvps = JSON.parse(fs.readFileSync(RSVP_FILE, "utf-8"));
        }

        if (rsvps.length === 0) {
          await sendTelegramMessage(chatIdOnMessage, "Список гостей пока пуст.");
          return;
        }

        let attendingCount = 0;
        let declinedCount = 0;
        let totalGuests = 0;

        const listLines = rsvps.map((r: any, idx: number) => {
          const isAttending = r.attending === "yes";
          if (isAttending) {
            attendingCount++;
            const guestNum = parseInt(r.guests) || 1;
            totalGuests += guestNum;
          } else {
            declinedCount++;
          }

          let line = `${idx + 1}. <b>${r.name}</b>\n   Статус: ${isAttending ? "Прибудет" : "Не прибудет"}`;
          if (isAttending) {
            line += ` (Человек: ${r.guests})`;
          }
          if (r.guest2Name) {
            line += `\n   Спутник: ${r.guest2Name}`;
          }
          if (r.message && r.message.trim()) {
            line += `\n   Текст: <i>${r.message.trim()}</i>`;
          }
          return line;
        });

        const header = `<b>Текущий список гостей усадьбы:</b>\nВсего откликов: ${rsvps.length}\nПрибудет человек: ${totalGuests} (из ${attendingCount} семейств)\nНе прибудет: ${declinedCount}\n\n`;
        const fullMessage = header + listLines.join("\n\n");

        if (fullMessage.length < 4000) {
          await sendTelegramMessage(chatIdOnMessage, fullMessage);
        } else {
          let currentChunk = header;
          for (let i = 0; i < listLines.length; i++) {
            const line = listLines[i] + "\n\n";
            if (currentChunk.length + line.length > 3900) {
              await sendTelegramMessage(chatIdOnMessage, currentChunk);
              currentChunk = "";
            }
            currentChunk += line;
          }
          if (currentChunk.trim()) {
            await sendTelegramMessage(chatIdOnMessage, currentChunk);
          }
        }
      } catch (err) {
        console.error("Failed to read RSVPs in webhook", err);
        await sendTelegramMessage(chatIdOnMessage, "Ошибка при чтении списка гостей со стороны усадьбы.");
      }
    }
  });

  // Yandex OAuth URL
  app.get("/api/auth/yandex/url", (req, res) => {
    const { clientId } = getYandexConfig();
    const cleanAppUrl = getAppUrl(req);
    const redirectUri = `${cleanAppUrl}/auth/callback/yandex`;
    
    console.log("Generating Yandex Auth URL with redirect_uri:", redirectUri);

    if (!clientId) {
      return res.status(500).json({ error: "Yandex Client ID not configured" });
    }

    const authUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.json({ url: authUrl });
  });

  // Yandex OAuth Callback
  app.get(["/auth/callback/yandex", "/auth/callback/yandex/"], async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
      return res.send("Auth failed: No code provided");
    }

    try {
      const cleanAppUrl = getAppUrl(req);
      const redirectUri = `${cleanAppUrl}/auth/callback/yandex`;

      const { clientId, clientSecret } = getYandexConfig();

      // Exchange code for token
      const tokenResponse = await fetch("https://oauth.yandex.ru/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: String(code),
          client_id: clientId || "",
          client_secret: clientSecret || "",
          redirect_uri: redirectUri
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenData.access_token) {
        throw new Error("Failed to get access token: " + JSON.stringify(tokenData));
      }

      // Get user info
      const userResponse = await fetch("https://login.yandex.ru/info?format=json", {
        headers: { Authorization: `OAuth ${tokenData.access_token}` },
      });
      
      const userData = await userResponse.json();
      console.log("Fetched Yandex user info for login:", userData.login, "email:", userData.default_email);

      // Return content that closes the popup and sends data to parent (or redirects back with state on mobile)
      res.send(`
        <html>
          <body>
            <script>
              var userData = ${JSON.stringify(userData)};
              var successUrl = '/?logged_in=true&yandex_user=' + encodeURIComponent(JSON.stringify(userData));
              
              if (window.opener) {
                try {
                  window.opener.postMessage({ 
                    type: 'OAUTH_AUTH_SUCCESS', 
                    user: userData 
                  }, '*');
                  // Give it a tiny moment to post message, then try to close
                  setTimeout(function() {
                    window.close();
                  }, 150);
                } catch (e) {
                  // Fallback if opener postMessage fails due to cross-origin or other restrictions
                  window.location.href = successUrl;
                }
              } else {
                window.location.href = successUrl;
              }
            </script>
            <p>Авторизация успешна. Возврат к сайту...</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Yandex Auth Error:", error);
      res.status(500).send("Authentication failed: " + error?.message);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
