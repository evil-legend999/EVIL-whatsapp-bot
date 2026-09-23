import { commands } from "../handlers/messageHandler.js";

export default {
    name: "!menu",
    description: "Display EVIL Bot command menu",
    execute: async (sock, message) => {
        const menuText = `
🔥 *EVIL BOT CORE SYSTEM* 🔥
━━━━━━━━━━━━━━━

📌 *GENERAL & SYSTEM*
!ping, !menu, !info, !uptime, !system, !time, !date, !version, !support, !rules, !owner, !donate, !pinghost, !changelog, !features

🎨 *MEDIA & CONVERTERS*
!sticker, !toimg, !tomp3, !tovn, !yomp3, !yomp4, !tiktok, !instagram, !facebook, !twitter, !pinterest, !lyrics, !shazam, !qr, !readqr

🤖 *AI & SEARCH*
!ai, !dalle, !rembg, !translate, !define, !wiki, !weather, !currency, !crypto, !news, !github, !shorten, !ocr, !tts, !summarize

🛠️ *UTILITIES*
!math, !calc, !password, !echo, !say, !shout, !reverse, !uppercase, !lowercase, !binary, !base64encode, !base64decode, !len, !wordcount, !fancy

🎮 *FUN & GAMES*
!roll, !dice, !flip, !coin, !8ball, !joke, !fact, !quote, !rate, !choose, !random, !truth, !dare, !tictactoe, !trivia

👥 *GROUP MANAGEMENT*
!groupinfo, !groupid, !myid, !tagall, !admins, !grouplink, !poll, !kick, !add, !promote, !demote, !mute, !unmute, !setname, !setdesc

⚙️ *ADMIN & CONTROL*
!delete, !contact, !location, !clear, !read, !restart, !block, !unblock, !broadcast, !eval

━━━━━━━━━━━━━━━
⚡ Total Loaded: ${commands.size} Commands
🟢 Status: EVIL Active
`;

        await sock.sendMessage(
            message.key.remoteJid,
            { text: menuText },
            { quoted: message }
        );
    }
};
