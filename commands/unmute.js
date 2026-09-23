export default {
    name: "!unmute",
    description: "Unmute group chat",
    execute: async (sock, message) => {
        if (!message.key.remoteJid.endsWith("@g.us")) return;
        await sock.groupSettingUpdate(message.key.remoteJid, "not_announcement");
        await sock.sendMessage(message.key.remoteJid, { text: "🔓 Group chat unmuted. Everyone can send messages." });
    }
};
