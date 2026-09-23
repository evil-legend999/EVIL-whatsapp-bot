export default {
    name: "!ping",
    description: "Check if the bot is online",
    execute: async (sock, message) => {
        await sock.sendMessage(
            message.key.remoteJid,
            { text: "🏓 Pong!\nBot is online." },
            { quoted: message }
        );
    }
};
