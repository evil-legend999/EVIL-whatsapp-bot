export default {
    name: "!mute",
    description: "Mute group chat",
    execute: async (sock, message) => {
        if (!message.key.remoteJid.endsWith("@g.us")) return;
        await sock.groupSettingUpdate(message.key.remoteJid, "announcement");
        await sock.sendMessage(message.key.remoteJid, { text: "🔒 Group chat muted. Only admins can send messages." });
    }
};
