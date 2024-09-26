const axios = require("axios");
const qrcode = require("qrcode-terminal");
// const { Client, MessageMedia } = require("whatsapp-web.js");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const cron = require("node-cron");
const puppeteer = require("puppeteer");

// const client = new Client();

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: puppeteer.executablePath(),
  },
});

const USER_AGENT = "ExpoGhanaCommunityBot/1.0";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
// const GITHUB_TOKEN = "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";
const GITHUB_API = "https://api.github.com";

const GITHUB_USERNAMES = [
  "sonnysam",
  "kbis",
  "PapaDaCodr",
  "isaacobenzy",
  "FaWayo",
  "Quojo-Steve",
  "Emmanuel19-code",
  "Zormelo-Alex",
  "Sammyoun19",
  "Essu-man",
  "Drco-code",
  "krepinnegga",
  "Alfredappiagyei",
  "dr-robotnic456",
  "Elton-S",
  "ikmazameti",
  "OpokuAgyemang32",
  "PrinceDev4401",
  "bundana",
  "Adamn1717",
  "Tiisu",
  "allconditionguy",
  "Gabby-Tech1",
  "amankwafrifa12",
  "cross19xx",
  "kaysamDev",
  "La-sie",
  "Techwithnate",
  "StormGear",
  "akisupi",
  "ElormLokpo",
  "Daslaw",
  "Princeoduro-dev",
  "Hughesneal88",
  "ap-liza",
  "imoempire",
  "Dennisblay",
  "kaeytee",
  "ThaPrince101",
  "Aliu2211",
  "daduam",
  "kb603",
  "NanaOdoom",
  "Cham-X",
  "tormgibbs",
  "EunicePobee",
  "Christian-Mamah",
  "douglastawile",
  "Rasheed124",
  "Konadu-Akwasi-Akuoko",
  "Kwasi_dev",
];

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Expo Ghana Community Bot is ready!");
  startCronJob();
});

async function getContributions(username) {
  const today = new Date();
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    const response = await axios.get(`${GITHUB_API}/users/${username}/events`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });

    const contributions = response.data
      .filter((event) => new Date(event.created_at) >= oneWeekAgo)
      .filter((event) =>
        ["PushEvent", "PullRequestEvent", "IssuesEvent"].includes(event.type)
      ).length;

    return { username, contributions };
  } catch (error) {
    console.error(`Error fetching data for ${username}:`, error.message);
    return { username, contributions: "Error" };
  }
}

async function sendContributionsUpdate(chat) {
  const contributionsData = await Promise.all(
    GITHUB_USERNAMES.map(getContributions)
  );

  let message = "📊 GitHub Contributions (Last 7 Days):\n\n";
  contributionsData.forEach(({ username, contributions }) => {
    message += `${username}: ${contributions} ${getContributionEmoji(
      contributions
    )}\n`;
  });

  chat.sendMessage(message);
}

function getContributionEmoji(contributions) {
  if (contributions === "Error") return "❓";
  if (contributions === 0) return "😴";
  if (contributions < 5) return "🌱";
  if (contributions < 10) return "🌿";
  if (contributions < 20) return "🌳";
  return "🚀";
}

function startCronJob() {
  // Run every day at 9 AM
  cron.schedule("0 9 * * *", () => {
    console.log("Running daily contribution update task");
    client.getChats().then((chats) => {
      const targetChat = chats.find(
        (chat) => chat.name === "Expo Ghana Community"
        // (chat) => chat.name === "Bot Test Lab"
      );
      if (targetChat) {
        sendContributionsUpdate(targetChat);
      }
    });
  });
}

// yarn add whatsapp-web.js qrcode-terminal axios node-cron

client.on("message", async (msg) => {
  const chat = await msg.getChat();

  switch (msg.body.toLowerCase()) {
    case "!bot":
      msg.reply(`
        Ɛte sɛn! 👋 I'm the Expo Ghana Community Bot 🇬🇭
        Need help? Type *!help* for a list of commands 📃
        Don't forget to pray, push code, collaborate, and enjoy some waakye today!😋
        Built with ❤️ for Expo developers in Ghana
        I need waakye~net to survive 😥
        Dm the admin to help support me
      `);
      break;

    case "!help":
      msg.reply(`
        *Expo Ghana Community Bot Commands*
        !bot: Wake me up 😎
        !github: Show GitHub contributions
        !expo: Get a random Expo tip
        !jollof: Settle the Jollof debate 🇬🇭🇳🇬
        !proverb: Get a Ghanaian proverb
        !challenge: Get a coding challenge
        !meme: Display a random programming meme
        !weather: Check Accra's weather
        !everyone: Tag all group members
        More features coming soon! 🚀
      `);
      break;

    case "!github":
      if (chat.isGroup) {
        await sendContributionsUpdate(chat);
      } else {
        msg.reply("This command can only be used in the community group!");
      }
      break;

    case "!expo":
      const expoTips = [
        "Use Expo's built-in components for a consistent look across platforms!",
        "Expo's over-the-air updates let you push fixes without app store approval.",
        "Take advantage of Expo's built-in push notification service for easy notifications.",
        "Use Expo's Asset system to efficiently handle images and other assets.",
        "Expo's SecureStore API is great for storing sensitive data on the device.",
        "Remember to eject from Expo if you need to add custom native modules.",
        "Expo's Camera component makes it easy to integrate camera functionality.",
        "Use Expo's Location API for GPS and geolocation features in your app.",
        "Expo's Font API allows you to easily use custom fonts in your app.",
        "Leverage Expo's Audio API for playing sounds and music in your application.",
        "Expo's Haptics API lets you add tactile feedback to your app interactions.",
        "Use Expo's Video component to easily integrate video playback in your app.",
        "Expo's SQLite module provides a powerful local database solution.",
        "Take advantage of Expo's in-app purchases API for monetization.",
        "Use Expo's Google Sign-In for easy authentication in your apps.",
      ];
      msg.reply(expoTips[Math.floor(Math.random() * expoTips.length)]);
      break;

    case "!jollof":
      const jollofResponses = [
        "Ghana Jollof reigns supreme! 🇬🇭👑 The perfect blend of spices and that smoky flavor... unbeatable!",
        "All Jollof is beautiful... but Ghana Jollof is the most beautiful! 😉 It's not bias, it's just facts!",
        "The only correct answer is Ghana Jollof! 🍚🔥 Even Nigerian princes secretly prefer it!",
        "Why argue? Let's just enjoy our superior Ghana Jollof! 😋 Life's too short for subpar Jollof.",
        "Ghana Jollof: so good, it should be illegal! 🚔🍛 But we're glad it's not!",
        "Ghana Jollof: turning rice into art since forever! 🎨🍚",
        "They say the way to a person's heart is through their stomach. Ghana Jollof is the express route! ❤️🍛",
        "Ghana Jollof: the real MVP of every party! 🎉🍚",
        "In the Olympics of Jollof, Ghana always takes the gold! 🥇🇬🇭",
        "Ghana Jollof: so delicious, even the ancestors approve! 👻👍",
      ];
      msg.reply(
        jollofResponses[Math.floor(Math.random() * jollofResponses.length)]
      );
      break;

    case "!proverb":
      const proverbs = [
        "Knowledge is like a garden; if it is not cultivated, it cannot be harvested.",
        "The river may be wide, but it must be crossed.",
        "A child who asks questions does not become a fool.",
        "One who causes others misfortune also teaches them wisdom.",
        "It is better to walk in the dark with a friend than alone in the light.",
        "When you follow in the path of your father, you learn to walk like him.",
        "The day you plant the seed is not the day you eat the fruit.",
        "No one tests the depth of a river with both feet.",
        "The path is made by walking.",
        "No matter how long the night, the day is sure to come.",
        "You do not teach the paths of the forest to an old gorilla.",
        "By the time the fool has learned the game, the players have dispersed.",
        "The one who eats alone, dies alone.",
        "The drum does not beat itself.",
        "Unity is strength, division is weakness.",
        "The earth is a calabash; if it breaks, where will we live?",
        "Money is sharp; it cuts its owner and cuts others.",
        "The lizard that jumped from the high iroko tree to the ground said he would praise himself if no one else did.",
        "The ruin of a nation begins in the homes of its people.",
        "The death that will kill a man begins as an appetite.",
      ];
      msg.reply(proverbs[Math.floor(Math.random() * proverbs.length)]);
      break;

    case "!challenge":
      const challenges = [
        "Create a simple Expo app that uses the device's camera to scan QR codes.",
        "Build a Ghana-themed quiz game using Expo and React Native elements.",
        "Implement a basic Akan name generator based on birth date input.",
        "Create a mobile app for tracking daily water intake with reminders.",
        "Build a simple Expo app that displays current cryptocurrency prices.",
        "Develop an Expo app that shows a map of popular tourist spots in Ghana.",
        "Create a mobile app for learning common phrases in different Ghanaian languages.",
        "Build a simple recipe app featuring popular Ghanaian dishes using Expo.",
        "Implement a basic weather app for major Ghanaian cities using Expo and a weather API.",
        "Create a mobile app for tracking and splitting expenses among friends.",
        "Develop a simple Expo app that generates random Adinkra symbols with their meanings.",
        "Build a basic task management app with local storage using Expo and AsyncStorage.",
        "Create a mobile app that displays daily affirmations or motivational quotes.",
        "Implement a simple music player app using Expo's Audio API.",
        "Build an Expo app that helps users learn about Ghanaian festivals and their dates.",
        "Create a mobile app for practicing basic arithmetic skills with a game-like interface.",
        "Develop an Expo app that showcases Ghanaian art and allows users to 'favorite' pieces.",
        "Build a simple habit tracker app using Expo and local storage.",
        "Create a mobile app that generates color palettes inspired by Ghanaian Kente cloth patterns.",
        "Implement a basic fitness app that tracks daily step count using Expo's Pedometer API.",
      ];
      msg.reply(
        `Today's Coding Challenge: ${
          challenges[Math.floor(Math.random() * challenges.length)]
        }`
      );
      break;

    // case "!meme":
    //   try {
    //     const response = await axios.get(
    //       "https://meme-api.herokuapp.com/gimme/ProgrammerHumor"
    //     );
    //     const memeUrl = response.data.url;
    //     const media = await MessageMedia.fromUrl(memeUrl);
    //     await client.sendMessage(msg.from, media, {
    //       caption: "Here's your programming meme! 😄",
    //     });
    //   } catch (error) {
    //     console.log(error);
    //     msg.reply(
    //       "Oops, having trouble retrieving a meme. Maybe the API is taking a coffee break! ☕"
    //     );
    //   }
    //   break;

    case "!meme":
      try {
        const response = await axios.get(
          "https://www.reddit.com/r/ProgrammerHumor/random/.json",
          {
            headers: { "User-Agent": USER_AGENT },
          }
        );

        const post = response.data[0].data.children[0].data;

        if (post.post_hint === "image") {
          const memeUrl = post.url;
          const memeTitle = post.title;
          const media = await MessageMedia.fromUrl(memeUrl);
          await client.sendMessage(msg.from, media, { caption: memeTitle });
        } else {
          msg.reply(
            "Oops! That wasn't an image. Try again for a funny programming meme!"
          );
        }
      } catch (error) {
        console.log(error);
        msg.reply(
          "Oops, having trouble retrieving a meme. The developers must be too busy debugging! 🐛🔍"
        );
      }
      break;

    case "!weather":
      try {
        const response = await axios.get(
          "https://api.openweathermap.org/data/2.5/weather",
          {
            params: {
              q: "Accra,GH",
              appid: "68e0a0071ba49ef6926d167b29efa3bc",
              units: "metric",
            },
          }
        );
        const weather = response.data;
        msg.reply(`
          Current weather in Accra:
          Temperature: ${weather.main.temp}°C
          Feels like: ${weather.main.feels_like}°C
          Humidity: ${weather.main.humidity}%
          Condition: ${weather.weather[0].description}
        `);
      } catch (error) {
        console.log(error);
        msg.reply(
          "Error retrieving weather information. The sun must be interfering with our satellites! 🛰️☀️"
        );
      }
      break;

    case "!everyone":
      if (chat.isGroup) {
        const mentions = chat.participants.map(
          (participant) => `@${participant.id.user}`
        );
        const mentionText =
          "Calling all Expo developers! 📱 " + mentions.join(" ");
        await chat.sendMessage(mentionText, { mentions: chat.participants });
      } else {
        msg.reply("This command can only be used in the community group!");
      }
      break;

    default:
      break;
  }
});

// Initialize the client
client.initialize();
