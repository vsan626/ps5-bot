import dotenv from 'dotenv';
import { Client, Intents } from 'discord.js';
import { discordChannel } from '../constants/app.constants';

dotenv.config({ path: '../../.env' });

export default class Discord {
  constructor() {
    this.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
    // login bot using token
    this.client.login(process.env.DISCORD_TOKEN);
  }

  sendMessage(message) {
    this.client.channels.cache.get(discordChannel).send(message);
  }
}
