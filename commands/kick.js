export default {
    name: "!kick",
    description: "Remove member from group",
    execute: async (sock, message, args) => {
        if (!message.key.remoteJid.endsWith("@g.us")) return;
        const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!target) return await sock.sendMessage(message.key.remoteJid, { text: "❌ Mention a user to kick!" }, { quoted: message });
        await sock.groupParticipantsUpdate(message.key.remoteJid, [target], "remove");
        await sock.sendMessage(message.key.remoteJid, { text: `🚨 User removed by EVIL Bot.` });
    }
};
