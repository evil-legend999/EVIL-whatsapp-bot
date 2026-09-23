import { downloadMediaMessage } from "@whiskeysockets/baileys";

export async function handleMessage(sock, message) {
    const text =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        message.message?.imageMessage?.caption ||
        message.message?.videoMessage?.caption ||
        "";

    if (!text) return;

    const trimmedText = text.trim();
    const args = trimmedText.split(/\s+/);
    const commandName = args.shift().toLowerCase();
    const sender = message.key.remoteJid;

    console.log(`📩 [${sender}] Executing: "${trimmedText}"`);

    // Helper to send quick text responses
    const reply = async (content) => {
        await sock.sendMessage(sender, { text: content }, { quoted: message });
    };

    switch (commandName) {
        // ==========================================
        // 1. GENERAL & UTILITY (1–15)
        // ==========================================
        case "!ping":
            await reply("🏓 Pong! EVIL BOT is active.");
            break;

        case "!menu":
        case "!help":
            await reply(`
🔥 *EVIL BOT COMMAND MENU* 🔥

📌 *1. GENERAL & UTILITY*
!ping | !menu | !info | !runtime | !owner | !speed | !version | !quote | !say | !flip | !roll | !time | !date | !calculator | !unit

📌 *2. GROUP MANAGEMENT*
!add | !kick | !promote | !demote | !group | !setname | !setdesc | !setpp | !tagall | !hidetag | !link | !revoke | !groupinfo | !admins | !leave

📌 *3. MEDIA & PROCESSING*
!sticker | !toimg | !tovideo | !crop | !emojimix | !textsticker | !take | !blur | !grayscale | !invert | !circle | !removebg | !ocr | !resize | !compress

📌 *4. SEARCH & DOWNLOADERS*
!song | !ytmp4 | !ytmp3 | !tiktok | !ig | !facebook | !twitter | !spotify | !image | !pinterest | !lyrics | !wikipedia | !weather | !dictionary | !translate

📌 *5. AI & TEXT TOOLS*
!ai | !dalle | !summarize | !rewrite | !code | !grammar | !math | !tts | !tts-anime | !readmore | !fancy | !binary

📌 *6. FUN & GAMES*
!truth | !dare | !joke | !meme | !roast | !fact | !riddle | !tictactoe | !simi | !character | !ship | !gayrate | !hack

📌 *7. OWNER & ADMIN*
!ban | !unban | !banlist | !block | !unblock | !clearchat | !broadcast | !setprefix | !mode | !restart | !shutdown | !eval | !exec | !backup | !status
`);
            break;

        case "!info":
            await reply("🤖 *EVIL BOT v1.0*\nEngine: Baileys Node.js\nStatus: 24/7 Cloud Ready");
            break;

        case "!runtime":
        case "!uptime":
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);
            await reply(`⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s`);
            break;

        case "!owner":
            await reply("👑 *Bot Owner:* EVIL Admin");
            break;

        case "!speed":
            const start = Date.now();
            await reply("⚡ Calculating latency...");
            const end = Date.now();
            await reply(`🚀 *Response Time:* ${end - start}ms`);
            break;

        case "!version":
            await reply("📦 *Current Version:* 1.0.0");
            break;

        case "!quote":
            const quotes = [
                "Do not wait for opportunities, create them.",
                "Work hard in silence, let your success be your noise.",
                "Code is like humor. When you have to explain it, it’s bad."
            ];
            await reply(`💬 "${quotes[Math.floor(Math.random() * quotes.length)]}"`);
            break;

        case "!say":
            if (!args.length) return reply("⚠️ Usage: !say [text]");
            await reply(args.join(" "));
            break;

        case "!flip":
            const result = Math.random() < 0.5 ? "Heads 🪙" : "Tails 🪙";
            await reply(`🪙 Coin Flip: *${result}*`);
            break;

        case "!roll":
            const roll = Math.floor(Math.random() * 6) + 1;
            await reply(`🎲 You rolled a *${roll}*!`);
            break;

        case "!time":
            await reply(`🕒 *Current Server Time:* ${new Date().toLocaleTimeString()}`);
            break;

        case "!date":
            await reply(`📅 *Current Date:* ${new Date().toLocaleDateString()}`);
            break;

        case "!calculator":
            if (!args.length) return reply("⚠️ Usage: !calculator [expression] (e.g. !calculator 5*10)");
            try {
                const evalResult = eval(args.join(""));
                await reply(`🧮 *Result:* ${evalResult}`);
            } catch {
                await reply("❌ Invalid mathematical expression.");
            }
            break;

        case "!unit":
            await reply("🛠️ Unit conversion feature ready.");
            break;

        // ==========================================
        // 2. GROUP MANAGEMENT (16–30)
        // ==========================================
        case "!add":
        case "!kick":
        case "!promote":
        case "!demote":
        case "!group":
        case "!setname":
        case "!setdesc":
        case "!setpp":
        case "!tagall":
        case "!hidetag":
        case "!link":
        case "!revoke":
        case "!groupinfo":
        case "!admins":
        case "!leave":
            await reply(`⚙️ Group Command *${commandName}* triggered.`);
            break;

        // ==========================================
        // 3. MEDIA & PROCESSING (31–45)
        // ==========================================
        case "!sticker":
        case "!s":
        case "!toimg":
        case "!tovideo":
        case "!crop":
        case "!emojimix":
        case "!textsticker":
        case "!take":
        case "!blur":
        case "!grayscale":
        case "!invert":
        case "!circle":
        case "!removebg":
        case "!ocr":
        case "!resize":
        case "!compress":
            await reply(`🖼️ Media Processor *${commandName}* called.`);
            break;

        // ==========================================
        // 4. SEARCH & DOWNLOADERS (46–60)
        // ==========================================
        case "!song":
        case "!play":
        case "!ytmp4":
        case "!ytmp3":
        case "!tiktok":
        case "!ig":
        case "!facebook":
        case "!twitter":
        case "!spotify":
        case "!image":
        case "!pinterest":
        case "!lyrics":
        case "!wikipedia":
        case "!weather":
        case "!dictionary":
        case "!translate":
            await reply(`📥 Search/Downloader *${commandName}* initialized.`);
            break;

        // ==========================================
        // 5. AI & TEXT TOOLS (61–72)
        // ==========================================
        case "!ai":
        case "!gpt":
        case "!dalle":
        case "!summarize":
        case "!rewrite":
        case "!code":
        case "!grammar":
        case "!math":
        case "!tts":
        case "!tts-anime":
        case "!readmore":
        case "!fancy":
        case "!binary":
            await reply(`🤖 AI Tool *${commandName}* processing input...`);
            break;

        // ==========================================
        // 6. FUN & GAMES (73–85)
        // ==========================================
        case "!truth":
        case "!dare":
        case "!joke":
            await reply("😂 Why don't programmers like nature? It has too many bugs.");
            break;
        case "!meme":
        case "!roast":
        case "!fact":
        case "!riddle":
        case "!tictactoe":
        case "!simi":
        case "!character":
        case "!ship":
        case "!gayrate":
            const rate = Math.floor(Math.random() * 100);
            await reply(`🏳️‍🌈 Gayrate meter: *${rate}%*`);
            break;
        case "!hack":
            await reply("👨‍💻 *HACKING TARGET...*\n[33%] Accessing WhatsApp DB...\n[66%] Extracting Messages...\n[100%] Hack complete (Prank!).");
            break;

        // ==========================================
        // 7. OWNER & ADMIN MODERATION (86–100)
        // ==========================================
        case "!ban":
        case "!unban":
        case "!banlist":
        case "!block":
        case "!unblock":
        case "!clearchat":
        case "!broadcast":
        case "!setprefix":
        case "!mode":
        case "!restart":
        case "!shutdown":
        case "!eval":
        case "!exec":
        case "!backup":
        case "!status":
            await reply(`⚙️ Owner Command *${commandName}* executed.`);
            break;

        default:
            if (commandName.startsWith("!")) {
                console.log(`⚠️ Unhandled command: ${commandName}`);
            }
            break;
    }
}
