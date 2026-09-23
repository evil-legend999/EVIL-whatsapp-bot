export default {
    name: "!info",
    description: "Bot information",
    execute: async (sock, message) => {
        await sock.sendMessage(
            message.key.remoteJid,
            {
                text:
                    "🤖 WhatsApp Bot\n\n" +
                    "⚡ Powered by Node.js\n" +
                    "🔌 WhatsApp connection: Active\n" +
                    "💻 Platform: Linux"
            },
            { quoted: message }
        );
    }
};
