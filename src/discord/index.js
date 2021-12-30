import dotenv from 'dotenv';
import { Client, Intents } from 'discord.js';
import { discordChannel, url } from '../constants/app.constants';
import { messageEmbed } from './message-embed';

dotenv.config({ path: '../../.env' });

export default class Discord {
  constructor() {
    this.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
    // login bot using token
    this.client.login(process.env.DISCORD_TOKEN);
  }

  sendMessage(message) {
    const {
      productTitle,
      currentAvailability,
      imageUrl
    } = message;

    messageEmbed.title = productTitle;
    messageEmbed.url = url;
    messageEmbed.image.url = imageUrl;
    messageEmbed.description = currentAvailability;

    this.client.channels.cache.get(discordChannel).send({ embeds: [messageEmbed] });
  }
}
