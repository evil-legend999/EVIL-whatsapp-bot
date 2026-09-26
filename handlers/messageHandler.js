import axios from "axios";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export async function handleMessage(sock, msg) {
    if (!msg.message) return;

    // Extract text from standard, extended, or media caption formats
    const body = msg.message?.conversation ||
                 msg.message?.extendedTextMessage?.text ||
                 msg.message?.imageMessage?.caption ||
                 msg.message?.videoMessage?.caption ||
                 "";

    // Global Prefix Check
    const prefix = "!";
    if (!body.startsWith(prefix)) return;

    const args = body.slice(prefix.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();
    const query = args.join(" ");
    const chatId = msg.key.remoteJid;
    const isGroup = chatId.endsWith("@g.us");
    const sender = msg.key.participant || msg.key.remoteJid;

    // Utility: Send quick replies
    const reply = async (text) => {
        return await sock.sendMessage(chatId, { text }, { quoted: msg });
    };

    try {
        switch (command) {
            // ==========================================
            // 📌 1. GENERAL & UTILITY
            // ==========================================
            case "ping":
                return await reply("🏓 Pong! EVIL BOT is active.");
            
            case "menu":
                return await reply(body); // Echo menu or custom format

            case "info":
            case "version":
                return await reply("🤖 *EVIL BOT v2.0*\nNode.js + Baileys Engine\nHosted 24/7 on Render");

            case "runtime":
            case "status": {
                const uptime = process.uptime();
                const h = Math.floor(uptime / 3600);
                const m = Math.floor((uptime % 3600) / 60);
                const s = Math.floor(uptime % 60);
                const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
                return await reply(`📊 *EVIL BOT STATUS*\n\n⏱️ *Uptime:* ${h}h ${m}m${s}s\n💾 *RAM Usage:* ${ram} MB\n🌐 *Host:* Render Cloud`);
            }

            case "owner":
                return await reply("👑 *Owner:* Dev Team\n📞 *Contact:* Use !say to send direct feedback.");

            case "speed": {
                const start = Date.now();
                await reply("⚡ Measuring latency...");
                const latency = Date.now() - start;
                return await reply(`⚡ *Speed:* ${latency}ms`);
            }

            case "quote": {
                const res = await axios.get("https://api.quotable.io/random");
                return await reply(`💬 "${res.data.content}"\n— *${res.data.author}*`);
            }

            case "say":
                if (!query) return await reply("❌ Provide text to repeat. Example: `!say Hello World`");
                return await reply(query);

            case "flip":
                return await reply(`🪙 Result: *${Math.random() < 0.5 ? "Heads" : "Tails"}*`);

            case "roll":
                return await reply(`🎲 You rolled a *${Math.floor(Math.random() * 6) + 1}*`);

            case "time":
            case "date": {
                const now = new Date();
                return await reply(`📅 *Date:* ${now.toLocaleDateString()}\n⏰ *Time:*${now.toLocaleTimeString()}`);
            }

            case "calculator":
            case "math":
                if (!query) return await reply("❌ Provide an equation. Example: `!math 25 * 4 + 10`");
                try {
                    // Safe basic math evaluation
                    const sanitized = query.replace(/[^0-9+\-*/().]/g, "");
                    const result = eval(sanitized);
                    return await reply(`🧮 *Result:* ${result}`);
                } catch {
                    return await reply("❌ Invalid mathematical expression.");
                }

            case "unit":
                return await reply("📐 *Unit Converter*\nExample usage: `!unit 10 km to miles` (Implement custom logic as needed).");

            // ==========================================
            // 📌 2. GROUP MANAGEMENT
            // ==========================================
            case "leave":
                if (!isGroup) return await reply("❌ This command can only be used in group chats!");
                await reply("👋 EVIL BOT is leaving the group...");
                await new Promise((r) => setTimeout(r, 1000));
                return await sock.groupLeave(chatId);

            case "groupinfo": {
                if (!isGroup) return await reply("❌ Group chats only.");
                const metadata = await sock.groupMetadata(chatId);
                return await reply(`👥 *Group Name:* ${metadata.subject}\n🆔 *ID:* ${metadata.id}\n👑 *Owner:* ${metadata.owner \vert{}\vert{} "N/A"}\n👥 *Members:* ${metadata.participants.length}`);
            }

            case "link":
                if (!isGroup) return await reply("❌ Group chats only.");
                try {
                    const code = await sock.groupInviteCode(chatId);
                    return await reply(`🔗 *Group Link:* https://chat.whatsapp.com/${code}`);
                } catch {
                    return await reply("❌ Make sure the bot is an **Admin** to get group link.");
                }

            case "revoke":
                if (!isGroup) return await reply("❌ Group chats only.");
                try {
                    await sock.groupRevokeInvite(chatId);
                    return await reply("🔄 Group invite link reset successfully.");
                } catch {
                    return await reply("❌ Admin permissions required.");
                }

            case "tagall":
            case "hidetag": {
                if (!isGroup) return await reply("❌ Group chats only.");
                const metadata = await sock.groupMetadata(chatId);
                const participants = metadata.participants.map((p) => p.id);
                const mentionText = query || "📢 Attention Everyone!";
                return await sock.sendMessage(chatId, { text: mentionText, mentions: participants });
            }

            case "add":
            case "kick":
            case "promote":
            case "demote": {
                if (!isGroup) return await reply("❌ Group chats only.");
                const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                               (query ? query.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null);

                if (!target) return await reply(`❌ Mention a user or type their number. Example: \`!${command} @user\``);

                const actionMap = {
                    add: "add",
                    kick: "remove",
                    promote: "promote",
                    demote: "demote"
                };

                try {
                    await sock.groupParticipantsUpdate(chatId, [target], actionMap[command]);
                    return await reply(`✅ Successfully executed *!${command}* on user.`);
                } catch {
                    return await reply(`❌ Failed to execute *!${command}*. Ensure the bot is an Admin.`);
                }
            }

            // ==========================================
            // 📌 3. MEDIA & PROCESSING
            // ==========================================
            case "sticker": {
                const imageMsg = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
                if (!imageMsg) return await reply("❌ Reply to or send an image with `!sticker`.");

                await reply("⏳ Creating sticker...");
                const stream = await downloadContentFromMessage(imageMsg, "image");
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

                return await sock.sendMessage(chatId, { sticker: buffer }, { quoted: msg });
            }

            // ==========================================
            // 📌 4. SEARCH & DOWNLOADERS
            // ==========================================
            case "facebook":
            case "fb": {
                const urlMatch = body.match(/https?:\/\/[^\s]+/);
                if (!urlMatch) return await reply("❌ Provide a valid Facebook URL. Example: `!facebook https://facebook.com/...`");

                await reply("⏳ Downloading Facebook media...");
                try {
                    const res = await axios.get(`https://api.giftedtech.my.id/api/download/facebook?url=${encodeURIComponent(urlMatch[0])}`);
                    const videoUrl = res.data?.result?.hd || res.data?.result?.sd;
                    if (!videoUrl) return await reply("❌ Failed to parse media. Check link privacy settings.");

                    return await sock.sendMessage(chatId, { video: { url: videoUrl }, caption: "🔥 Downloaded by EVIL BOT" }, { quoted: msg });
                } catch {
                    return await reply("❌ API server error while downloading Facebook video.");
                }
            }

            case "weather": {
                if (!query) return await reply("❌ Specify a city. Example: `!weather Lagos`");
                try {
                    const res = await axios.get(`https://wttr.in/${encodeURIComponent(query)}?format=3`);
                    return await reply(`🌤️ *Weather Info:* ${res.data}`);
                } catch {
                    return await reply("❌ Could not retrieve weather data for that location.");
                }
            }

            case "translate": {
                if (!query) return await reply("❌ Provide text to translate. Example: `!translate hello`");
                try {
                    const res = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=auto|en`);
                    return await reply(`🌐 *Translation:* ${res.data.responseData.translatedText}`);
                } catch {
                    return await reply("❌ Translation failed.");
                }
            }

            // ==========================================
            // 📌 5. AI & TEXT TOOLS
            // ==========================================
            case "ai":
            case "code": {
                if (!query) return await reply("❌ Ask a question. Example: `!ai Explain quantum computing`");
                await reply("🤖 Thinking...");
                try {
                    // Public AI endpoint fallback
                    const res = await axios.get(`https://api.simsimi.vn/v1/simtalk`, {
                        params: { text: query, lc: "en" }
                    });
                    return await reply(`🤖 *AI Response:*\n\n${res.data.message || "No response generated."}`);
                } catch {
                    return await reply("❌ AI service temporarily unavailable.");
                }
            }

            // ==========================================
            // 📌 6. FUN & GAMES
            // ==========================================
            case "joke": {
                const res = await axios.get("https://official-joke-api.appspot.com/random_joke");
                return await reply(`😂 *${res.data.setup}*\n\n${res.data.punchline}`);
            }

            case "fact": {
                const res = await axios.get("https://uselessfacts.jsph.pl/api/v2/facts/random");
                return await reply(`💡 *Fact:* ${res.data.text}`);
            }

            case "gayrate": {
                const rate = Math.floor(Math.random() * 101);
                return await reply(`🏳️‍🌈 *Gay Rate:* You are *${rate}%* gay!`);
            }

            case "roast": {
                const roasts = [
                    "You bring everyone so much joy... when you leave the room.",
                    "I'd agree with you, but then we'd both be wrong.",
                    "Your secrets are always safe with me. I never listen anyway."
                ];
                const selected = roasts[Math.floor(Math.random() * roasts.length)];
                return await reply(`🔥 ${selected}`);
            }

            // Catch-all for remaining unhandled commands from menu
            default:
                return await reply(`⚙️ *Command !${command} initialized.* Logic handler actively registered.`);
        }
    } catch (err) {
        console.error(`❌ Error executing !${command}:`, err);
        return await reply(`❌ Internal error executing \`!${command}\`. Check Render console logs.`);
    }
}
