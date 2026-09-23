import { makeWASocket, useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import { handleMessage } from "./handlers/messageHandler.js";

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

    const sock = makeWASocket({
        auth: state,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("\n⚡ SCAN THE QR CODE BELOW WITH WHATSAPP ⚡\n");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Connection closed. Reconnecting:", shouldReconnect);
            if (shouldReconnect) {
                startBot();
            } else {
                console.log("❌ Logged out. Delete 'auth_info_baileys' folder and restart to re-scan.");
            }
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
