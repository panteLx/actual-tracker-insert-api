import fetch from "node-fetch";
import { config } from "../config/config.js";

class DiscordService {
  async sendTransactionNotification(
    transaction,
    trackerType,
    userEmail,
    debugMessage
  ) {
    if (!config.discord.webhookUrl) return;

    const embed = {
      title: `New ${
        trackerType.charAt(0).toUpperCase() + trackerType.slice(1)
      } Transaction Added`,
      color: 0x00ff00,
      fields: [
        { name: "Date", value: transaction.date, inline: true },
        {
          name: "Amount",
          value: `€${transaction.amount.toFixed(2)}`,
          inline: true,
        },
        { name: "Payee", value: transaction.payee_name, inline: false },
        { name: "Notes", value: transaction.notes || "None", inline: false },
        {
          name: "Debug",
          value: config.discord.debug ? debugMessage : "DEBUG DISABLED",
          inline: false,
        },
        { name: "User", value: userEmail, inline: false },
      ],
      timestamp: new Date(),
      footer: {
        text: `${
          trackerType.charAt(0).toUpperCase() + trackerType.slice(1)
        } Tracker - ${process.env.NODE_ENV}`,
      },
    };

    await fetch(config.discord.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  }
}

export const discordService = new DiscordService();
