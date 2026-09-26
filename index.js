import http from "http";
// 1. Import 'Browsers' alongside your other imports
import { makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } from "@whiskeysockets/baileys";
import { handleMessage } from "./handlers/messageHandler.js";

const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("EVIL BOT IS ALIVE ON RENDER");
}).listen(PORT, () => {
    console.log(`🌐 Server listening on port ${PORT}`);
});

const PHONE_NUMBER = process.env.PHONE_NUMBER;

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        // 2. Set official Ubuntu Chrome browser identity:
        browser: Browsers.ubuntu("Chrome"),
        syncFullHistory: false
    });

    sock.ev.on("creds.update", saveCreds);

    if (!sock.authState.creds.registered) {
        if (!PHONE_NUMBER) {
            console.error("❌ ERROR: PHONE_NUMBER environment variable is not set!");
            return;
        }

        setTimeout(async () => {
            try {
                // Request phone pairing code using the configured browser signature
                const code = await sock.requestPairingCode(PHONE_NUMBER.trim());
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
