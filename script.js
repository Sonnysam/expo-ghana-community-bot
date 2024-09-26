// Import required modules
const axios = require("axios");
const qrcode = require("qrcode-terminal");
const { Client, MessageMedia } = require("whatsapp-web.js");
const rf = require("random-facts");
const weather = require("weather-js");
const randomVerse = require("random-verse");
const quoteGenerator = require("random-quote-generator");

// Create a new client instance
const client = new Client();

const news_api_key = "dc991c25506d41fda473af8a9ee1b878";
const otd_api_url = "https://today.zenquotes.io/api/today";

// When the client receives a QR code
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

// When the client is ready
client.on("ready", () => {
  console.log("Client is ready!");
});

// Handle incoming messages
client.on("message", async (msg) => {
  const chat = await msg.getChat();

  switch (msg.body) {
    case "!bot":
      msg.reply(`
        I am alive 🚀 
        Do you need help? 🧐
        Use *!help* to access command list 📃
        Don't forget to eat gɔbɛ and pray today 😋
        Built with ❤️ by *Samuel Agbenyo*
      `);
      break;

    case "!quote":
      msg.reply(quoteGenerator.generateAQuote());
      break;

    case "!facts":
      msg.reply(rf.randomFact());
      break;

    case "!verse":
      msg.reply(randomVerse());
      break;

    case "!help":
      msg.reply(`
        *!meme* displays a random meme
        *!bot*: checks if I'm awake
        *!joke*: displays a random joke
        *!weather*: displays current weather in Accra
        *!everyone*: mentions or tags everyone
        *!facts*: generates random facts
        *!quote*: generates random quotes
        *!verse*: generates verse of the day
        *otd*: generates historical events of today
        *More commands coming soon 😁*
      `);
      break;

    case "!groupinfo":
      if (chat.isGroup) {
        msg.reply(`
          *Group Details*
          Name: ${chat.name}
          Description: ${chat.description}
          Created At: ${chat.createdAt.toString()}
          Created By: ${chat.owner.user}
          Participant count: ${chat.participants.length}
        `);
      } else {
        msg.reply("This command can only be used in a group!");
      }
      break;

    case "!everyone":
      const mentions = chat.participants.map(
        (participant) => `@${participant.id.user}`
      );
      const mentionText = mentions.join(" ");
      await chat.sendMessage(mentionText, { mentions: chat.participants });
      break;

    case "!weather":
      weather.find(
        { search: "Accra, Ghana", degreeType: "C" },
        (err, result) => {
          if (err) {
            console.log(err);
            msg.reply("Error retrieving weather information.");
          } else {
            const details = JSON.stringify(result, null, 2);
            msg.reply(details);
          }
        }
      );
      break;

    // case "!news":
    //   try {
    //     const news = await axios(
    //       "https://newsapi.org/v2/top-headlines?country=us&apiKey=dc991c25506d41fda473af8a9ee1b878"
    //     ).then((res) => res.data);
    //     const articles = news.articles;
    //     const article = articles[Math.floor(Math.random() * articles.length)];
    //     msg.reply(`
    //       *${article.title}*
    //       ${article.description}
    //       ${article.url}
    //     `);
    //   } catch (error) {
    //     console.log(error);
    //     msg.reply("Error retrieving news.");
    //   }
    //   break;

    case "!chats":
      const chats = await client.getChats();
      msg.reply(`I have ${chats.length} chats open.`);
      break;

    case "!info":
      const info = client.info;
      msg.reply(`
        *Connection info*
        User name: ${info.pushname}
        My number: ${info.wid.user}
        Platform: ${info.platform}
      `);
      break;
    case "!meme":
      try {
        // Fetch the memes from the imgflip API
        const response = await axios("https://api.imgflip.com/get_memes");
        const memes = response.data.data.memes;

        // Check if there are memes in the response
        if (memes.length === 0) {
          msg.reply("Oops no memes available.");
          return;
        }

        // Select a random meme
        const randomMeme = memes[Math.floor(Math.random() * memes.length)];

        // Retrieve the meme image
        const media = await MessageMedia.fromUrl(randomMeme.url);

        // Send the meme image
        await client.sendMessage(msg.from, media);
      } catch (error) {
        console.log(error);
        msg.reply("Oops, having trouble retrieving a meme.");
      }
      break;

    case "!joke":
      try {
        const joke = await axios(
          "https://v2.jokeapi.dev/joke/Any?safe-mode"
        ).then((res) => res.data);
        const jokeMsg = await client.sendMessage(
          msg.from,
          joke.setup || joke.joke
        );
        if (joke.delivery) {
          setTimeout(() => {
            jokeMsg.reply(joke.delivery);
          }, 1000);
        }
      } catch (error) {
        console.log(error);
        msg.reply("Error retrieving joke.");
      }
      break;
    case "!otd":
      try {
        const response = await axios(otd_api_url).then((res) => res.data);
        const quote = response[0].q;
        const author = response[0].a;
        msg.reply(`
          *${quote}*
          - ${author}
        `);
      } catch (error) {
        console.log(error);
        msg.reply("Error retrieving historical events.");
      }
      break;

    case "!news":
      try {
        // Fetch news articles from the NewsAPI
        const response = await axios.get("https://newsapi.org/v2/everything", {
          params: {
            q: "Apple",
            from: "2024-08-13",
            sortBy: "popularity",
            apiKey: "dc991c25506d41fda473af8a9ee1b878", // Your API key
          },
        });

        const articles = response.data.articles;

        // Check if there are articles in the response
        if (articles.length === 0) {
          msg.reply("No news articles found.");
          return;
        }

        // Select a random article
        const randomArticle =
          articles[Math.floor(Math.random() * articles.length)];

        // Construct the message content
        const messageContent = `
      *${randomArticle.title}*
      ${randomArticle.description}
      Read more: ${randomArticle.url}
    `;

        // Send the news article details
        await client.sendMessage(msg.from, messageContent);
      } catch (error) {
        console.error("Error fetching news:", error);
        msg.reply("Oops, having trouble retrieving news.");
      }
      break;

    default:
      break;
  }
});

// Initialize the client
client.initialize();
