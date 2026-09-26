import http from "http";
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import { handleMessage } from "./handlers/messageHandler.js";

// Health Check Server for Render (Default port is 10000 or process.env.PORT)
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("EVIL BOT IS ALIVE ON RENDER");
}).listen(PORT, () => {
    console.log(`🌐 Server listening on port ${PORT}`);
});

// WhatsApp Phone Number from Environment Variable
const PHONE_NUMBER = process.env.PHONE_NUMBER;

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // Disable terminal QR codes
        browser: ["EVIL Bot", "Chrome", "1.0.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    // Request 8-digit pairing code if session isn't registered yet
    if (!sock.authState.creds.registered) {
        if (!PHONE_NUMBER) {
            console.error("❌ ERROR: PHONE_NUMBER environment variable is not set!");
            return;
        }

        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(PHONE_NUMBER);
                console.log("\n====================================");
                console.log(`🔑 YOUR PAIRING CODE: ${code}`);
                console.log("====================================\n");
            } catch (err) {
                console.error("Failed to request pairing code:", err);
            }
        }, 5000);
    }

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            console.log(`Connection closed (status ${statusCode}). Reconnecting: ${shouldReconnect}`);
            
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log("🔥 EVIL BOT CONNECTED SUCCESSFULLY 🔥");
        }
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;
        for (const msg of messages) {
            try {
                await handleMessage(sock, msg);
            } catch (err) {
                console.error("Error handling message:", err);
            }
        }
    });
}

startBot();
