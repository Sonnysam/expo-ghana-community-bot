const axios = require("axios");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const cron = require("node-cron");
const puppeteer = require("puppeteer");
const {
  GITHUB_USERNAMES,
  EXPO_TIPS,
  CODING_CHALLENGES,
  JOLLOF_RESPONSES,
  GHANAIAN_PROVERBS,
  CONFIG,
  BOT_RESPONSES,
} = require("./config");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: puppeteer.executablePath(),
  },
});

async function getContributions(username) {
  const today = new Date();
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    const response = await axios.get(
      `${CONFIG.GITHUB_API}/users/${username}/events`,
      {
        headers: { Authorization: `token ${CONFIG.GITHUB_TOKEN}` },
      }
    );

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

function getContributionEmoji(contributions) {
  if (contributions === "Error") return "❓";
  if (contributions === 0) return "😴";
  if (contributions < 5) return "🌱";
  if (contributions < 10) return "🌿";
  if (contributions < 20) return "🌳";
  return "🚀";
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

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Command handlers
const commandHandlers = {
  "!bot": (msg) => msg.reply(BOT_RESPONSES.INTRO),
  "!help": (msg) => msg.reply(BOT_RESPONSES.HELP),
  "!github": async (msg, chat) => {
    if (chat.isGroup) {
      await sendContributionsUpdate(chat);
    } else {
      msg.reply(BOT_RESPONSES.GROUP_ONLY);
    }
  },
  "!expo": (msg) => msg.reply(getRandomElement(EXPO_TIPS)),
  "!jollof": (msg) => msg.reply(getRandomElement(JOLLOF_RESPONSES)),
  "!proverb": (msg) => msg.reply(getRandomElement(GHANAIAN_PROVERBS)),
  "!challenge": (msg) =>
    msg.reply(
      `Today's Coding Challenge: ${getRandomElement(CODING_CHALLENGES)}`
    ),
  "!meme": async (msg) => {
    try {
      const response = await axios.get(CONFIG.REDDIT_MEME_URL, {
        headers: { "User-Agent": CONFIG.USER_AGENT },
      });

      const post = response.data[0].data.children[0].data;

      if (post.post_hint === "image") {
        const media = await MessageMedia.fromUrl(post.url);
        await client.sendMessage(msg.from, media, { caption: post.title });
      } else {
        msg.reply(BOT_RESPONSES.MEME_ERROR);
      }
    } catch (error) {
      console.error(error);
      msg.reply(BOT_RESPONSES.MEME_FETCH_ERROR);
    }
  },
  "!weather": async (msg) => {
    try {
      const response = await axios.get(CONFIG.WEATHER_API_URL, {
        params: {
          q: CONFIG.WEATHER_CITY,
          appid: CONFIG.WEATHER_API_KEY,
          units: "metric",
        },
      });
      const weather = response.data;
      msg.reply(`
        Current weather in Accra:
        Temperature: ${weather.main.temp}°C
        Feels like: ${weather.main.feels_like}°C
        Humidity: ${weather.main.humidity}%
        Condition: ${weather.weather[0].description}
      `);
    } catch (error) {
      console.error(error);
      msg.reply(BOT_RESPONSES.WEATHER_ERROR);
    }
  },
  "!everyone": async (msg, chat) => {
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
  },
};
