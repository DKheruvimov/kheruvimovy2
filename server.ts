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
    let clientId = process.env.YANDEX_CLIENT_ID || "";
    let clientSecret = process.env.YANDEX_CLIENT_SECRET || "";
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
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to save rsvp" });
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

      // Return content that closes the popup and sends data to parent
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS', 
                  user: ${JSON.stringify(userData)} 
                }, '*');
                window.close();
              } else {
                window.location.href = '/?logged_in=true';
              }
            </script>
            <p>Authentication successful. Closing window...</p>
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
