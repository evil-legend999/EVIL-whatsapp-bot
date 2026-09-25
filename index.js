import http from "http";
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import { handleMessage } from "./handlers/messageHandler.js";

// Keep-Alive HTTP Server for Koyeb Health Checks
const PORT = process.env.PORT || 8080;
http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("EVIL BOT IS ALIVE ON KOYEB");
}).listen(PORT, () => {
    console.log(`🌐 Keep-alive server listening on port ${PORT}`);
});

// ⚠️ REPLACE THIS WITH YOUR WHATSAPP NUMBER (Country code + number, NO '+' or spaces)
// Example for Nigeria: "2348123456789"
const PHONE_NUMBER = "234XXXXXXXXXX"; 

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false // Turn off QR code generation
    });

    sock.ev.on("creds.update", saveCreds);

    // Request 8-digit pairing code if session is not saved
    if (!sock.authState.creds.registered) {
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
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Connection closed. Reconnecting:", shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log("🔥 EVIL BOT CONNECTED SUCCESSFULLY 🔥");
        }
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;
        for (const msg of messages) {
            await handleMessage(sock, msg);
        }
    });
}

startBot();
