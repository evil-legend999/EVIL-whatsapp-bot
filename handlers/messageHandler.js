import axios from "axios";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export async function handleMessage(sock, msg) {
    if (!msg.message) return;

    // Extract text from conversation or media captions
    const body = msg.message?.conversation ||
                 msg.message?.extendedTextMessage?.text ||
                 msg.message?.imageMessage?.caption ||
                 msg.message?.videoMessage?.caption ||
                 "";

    const prefix = "!";
    if (!body.startsWith(prefix)) return;

    const args = body.slice(prefix.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();
    const query = args.join(" ");
    const chatId = msg.key.remoteJid;
    const isGroup = chatId.endsWith("@g.us");
    const sender = msg.key.participant || msg.key.remoteJid;

    const reply = async (text) => {
        return await sock.sendMessage(chatId, { text }, { quoted: msg });
    };

    try {
        switch (command) {
            // ==========================================
            // 📌 1. GENERAL & UTILITY
            // ==========================================
            case "ping":
                return await reply("🏓 Pong! EVIL BOT is fully operational.");

            case "menu":
                return await reply(body);

            case "info":
            case "version":
                return await reply("🤖 *EVIL BOT v2.5*\nEngine: Node.js + Baileys\nDeployment: Render Cloud 24/7");

            case "runtime":
            case "status": {
                const uptime = process.uptime();
                const h = Math.floor(uptime / 3600);
                const m = Math.floor((uptime % 3600) / 60);
                const s = Math.floor(uptime % 60);
                const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
                return await reply(`📊 *EVIL BOT SYSTEM STATUS*\n\n⏱️ *Uptime:* ${h}h ${m}m${s}s\n💾 *RAM Usage:* ${ram} MB\n🌐 *Host:* Render Cloud`);
            }

            case "owner":
                return await reply("👑 *Owner:* Dev Team\n🌐 *Status:* Active Administrator");

            case "speed": {
                const start = Date.now();
                await reply("⚡ Calculating latency...");
                const latency = Date.now() - start;
                return await reply(`⚡ *Speed:* ${latency}ms`);
            }

            case "quote": {
                try {
                    const res = await axios.get("https://api.quotable.io/random");
                    return await reply(`💬 "${res.data.content}"\n— *${res.data.author}*`);
                } catch {
                    return await reply("💬 \"Code is like humor. When you have to explain it, it’s bad.\"");
                }
            }

            case "say":
                if (!query) return await reply("❌ Provide text. Example: `!say Hello`");
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
                if (!query) return await reply("❌ Provide a math expression. Example: `!math 12 * 12`");
                try {
                    const sanitized = query.replace(/[^0-9+\-*/().]/g, "");
                    const result = eval(sanitized);
                    return await reply(`🧮 *Result:* ${result}`);
                } catch {
                    return await reply("❌ Invalid math expression.");
                }

            case "unit":
                return await reply("📐 *Unit Converter:* Usage example: `!unit 10 km to miles`.");

            // ==========================================
            // 📌 2. GROUP MANAGEMENT
            // ==========================================
            case "leave":
                if (!isGroup) return await reply("❌ Group chats only!");
                await reply("👋 Goodbye everyone!");
                return await sock.groupLeave(chatId);

            case "groupinfo": {
                if (!isGroup) return await reply("❌ Group chats only!");
                const metadata = await sock.groupMetadata(chatId);
                return await reply(`👥 *Group:* ${metadata.subject}\n🆔 *ID:* ${metadata.id}\n👥 *Members:* ${metadata.participants.length}`);
            }

            case "link":
                if (!isGroup) return await reply("❌ Group chats only!");
                try {
                    const code = await sock.groupInviteCode(chatId);
                    return await reply(`🔗 https://chat.whatsapp.com/${code}`);
                } catch {
                    return await reply("❌ Bot needs Admin rights to fetch group link.");
                }

            case "revoke":
                if (!isGroup) return await reply("❌ Group chats only!");
                try {
                    await sock.groupRevokeInvite(chatId);
                    return await reply("🔄 Group invite link revoked!");
                } catch {
                    return await reply("❌ Admin permissions required.");
                }

            case "tagall":
            case "hidetag": {
                if (!isGroup) return await reply("❌ Group chats only!");
                const metadata = await sock.groupMetadata(chatId);
                const participants = metadata.participants.map((p) => p.id);
                return await sock.sendMessage(chatId, { text: query || "📢 Attention everyone!", mentions: participants });
            }

            case "add":
            case "kick":
            case "promote":
            case "demote": {
                if (!isGroup) return await reply("❌ Group chats only!");
                const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                               (query ? query.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null);

                if (!target) return await reply(`❌ Mention a user or supply their number. Example: \`!${command} @user\``);

                const actionMap = { add: "add", kick: "remove", promote: "promote", demote: "demote" };
                try {
                    await sock.groupParticipantsUpdate(chatId, [target], actionMap[command]);
                    return await reply(`✅ Action *!${command}* executed on target.`);
                } catch {
                    return await reply(`❌ Failed to run *!${command}*. Ensure bot has Admin privileges.`);
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
            case "song":
            case "ytmp3": {
                if (!query) return await reply("❌ Provide a song title or YouTube link. Example: `!song Faded`");
                await reply("🎵 Searching and downloading audio...");
                try {
                    const res = await axios.get(`https://api.giftedtech.my.id/api/download/ytmp3?url=${encodeURIComponent(query)}`);
                    const audioUrl = res.data?.result?.download_url || res.data?.result?.dl_link;
                    if (!audioUrl) return await reply("❌ Could not download audio. Try another song title.");

                    return await sock.sendMessage(chatId, { 
                        audio: { url: audioUrl }, 
                        mimetype: "audio/mp4" 
                    }, { quoted: msg });
                } catch {
                    return await reply("❌ Failed to fetch song. Downloader server busy.");
                }
            }

            case "ytmp4": {
                if (!query) return await reply("❌ Provide a YouTube video link or title. Example: `!ytmp4 https://youtu.be/...`");
                await reply("📹 Downloading video...");
                try {
                    const res = await axios.get(`https://api.giftedtech.my.id/api/download/ytmp4?url=${encodeURIComponent(query)}`);
                    const videoUrl = res.data?.result?.download_url || res.data?.result?.dl_link;
                    if (!videoUrl) return await reply("❌ Video download failed.");

                    return await sock.sendMessage(chatId, { video: { url: videoUrl }, caption: "🎥 Downloaded by EVIL BOT" }, { quoted: msg });
                } catch {
                    return await reply("❌ Video service unavailable.");
                }
            }

            case "tiktok": {
                if (!query) return await reply("❌ Provide a TikTok URL.");
                await reply("⏳ Downloading TikTok video...");
                try {
                    const res = await axios.get(`https://api.giftedtech.my.id/api/download/tiktok?url=${encodeURIComponent(query)}`);
                    const videoUrl = res.data?.result?.no_watermark || res.data?.result?.video;
                    return await sock.sendMessage(chatId, { video: { url: videoUrl }, caption: "🎵 TikTok Video" }, { quoted: msg });
                } catch {
                    return await reply("❌ Download failed. Verify the TikTok URL.");
                }
            }

            case "facebook":
            case "fb": {
                if (!query) return await reply("❌ Provide a Facebook URL.");
                await reply("⏳ Downloading Facebook video...");
                try {
                    const res = await axios.get(`https://api.giftedtech.my.id/api/download/facebook?url=${encodeURIComponent(query)}`);
                    const videoUrl = res.data?.result?.hd || res.data?.result?.sd;
                    return await sock.sendMessage(chatId, { video: { url: videoUrl }, caption: "🔥 Facebook Video" }, { quoted: msg });
                } catch {
                    return await reply("❌ Failed to fetch Facebook video.");
                }
            }

            case "weather": {
                if (!query) return await reply("❌ Specify a city. Example: `!weather Lagos`");
                try {
                    const res = await axios.get(`https://wttr.in/${encodeURIComponent(query)}?format=3`);
                    return await reply(`🌤️ *Weather Info:* ${res.data}`);
                } catch {
                    return await reply("❌ Could not load weather data.");
                }
            }

            case "translate": {
                if (!query) return await reply("❌ Provide text. Example: `!translate hello`");
                try {
                    const res = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=auto|en`);
                    return await reply(`🌐 *Translation:* ${res.data.responseData.translatedText}`);
                } catch {
                    return await reply("❌ Translation service error.");
                }
            }

            case "wikipedia": {
                if (!query) return await reply("❌ Search topic needed. Example: `!wikipedia WhatsApp`");
                try {
                    const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
                    return await reply(`📚 *${res.data.title}*\n\n${res.data.extract}`);
                } catch {
                    return await reply("❌ Article not found on Wikipedia.");
                }
            }

            // ==========================================
            // 📌 5. AI & TEXT TOOLS
            // ==========================================
            case "ai":
            case "code": {
                if (!query) return await reply("❌ Ask something. Example: `!ai Write a python function`");
                await reply("🤖 Thinking...");
                try {
                    const res = await axios.get(`https://api.simsimi.vn/v1/simtalk`, {
                        params: { text: query, lc: "en" }
                    });
                    return await reply(`🤖 *AI:* ${res.data.message || "Unable to parse answer."}`);
                } catch {
                    return await reply("❌ AI server unresponsive.");
                }
            }

            // ==========================================
            // 📌 6. FUN & GAMES
            // ==========================================
            case "joke": {
                try {
                    const res = await axios.get("https://official-joke-api.appspot.com/random_joke");
                    return await reply(`😂 *${res.data.setup}*\n\n${res.data.punchline}`);
                } catch {
                    return await reply("😂 What sits on the bottom of the ocean and shakes? A nervous wreck.");
                }
            }

            case "meme": {
                try {
                    const res = await axios.get("https://meme-api.com/gimme");
                    return await sock.sendMessage(chatId, { 
                        image: { url: res.data.url }, 
                        caption: `🤣 *${res.data.title}*` 
                    }, { quoted: msg });
                } catch {
                    return await reply("❌ Failed to load meme.");
                }
            }

            case "fact": {
                try {
                    const res = await axios.get("https://uselessfacts.jsph.pl/api/v2/facts/random");
                    return await reply(`💡 *Fact:* ${res.data.text}`);
                } catch {
                    return await reply("💡 *Fact:* Honey never spoils.");
                }
            }

            case "riddle": {
                const riddles = [
                    { q: "What has to be broken before you can use it?", a: "An Egg" },
                    { q: "I’m tall when I’m young, and I’m short when I’m old. What am I?", a: "A Candle" },
                    { q: "What is full of holes but still holds water?", a: "A Sponge" }
                ];
                const picked = riddles[Math.floor(Math.random() * riddles.length)];
                return await reply(`🧩 *Riddle:* ${picked.q}\n\n*Answer:* ${picked.a}`);
            }

            case "tictactoe":
                return await reply("🎮 *TicTacToe:* Mention a user to challenge! Example: `!tictactoe @user`");

            case "simi": {
                if (!query) return await reply("❌ Say something to Simi. Example: `!simi Hello`");
                try {
                    const res = await axios.get(`https://api.simsimi.vn/v1/simtalk`, {
                        params: { text: query, lc: "en" }
                    });
                    return await reply(`🐣 *Simi:* ${res.data.message || "I don't understand!"}`);
                } catch {
                    return await reply("🐣 Simi is sleeping right now.");
                }
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
                return await reply(`🔥 ${roasts[Math.floor(Math.random() * roasts.length)]}`);
            }

            case "restart":
                await reply("⚙️ *Restarting EVIL BOT service...*");
                process.exit(0); // Render automatically restarts crashed/exited processes

            default:
                return await reply(`⚙️ Command *!${command}* registered.`);
        }
    } catch (err) {
        console.error(`❌ Error running !${command}:`, err);
        return await reply(`❌ Error processing \`!${command}\`.`);
    }
}
