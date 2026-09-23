export default {
    name: "!promote",
    description: "Promote member to admin",
    execute: async (sock, message) => {
        if (!message.key.remoteJid.endsWith("@g.us")) return;
        const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!target) return await sock.sendMessage(message.key.remoteJid, { text: "❌ Mention a user to promote!" }, { quoted: message });
        await sock.groupParticipantsUpdate(message.key.remoteJid, [target], "promote");
        await sock.sendMessage(message.key.remoteJid, { text: `👑 User promoted to admin.` });
    }
};
