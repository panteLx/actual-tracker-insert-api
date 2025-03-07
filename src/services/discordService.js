import fetch from "node-fetch";
import { config } from "../config/config.js";
import logger, {
  logFunctionCall,
  logFunctionError,
} from "../middleware/logger.js";

class DiscordService {
  constructor() {
    logger.debug("DiscordService instance created");
  }

  async sendNotification(
    title,
    description,
    fields,
    userEmail,
    debugMessage,
    ping
  ) {
    const startTime = logFunctionCall("DiscordService.sendNotification", {
      title,
      userEmail,
      description,
      fields,
    });

    try {
      if (!config.discord.webhookUrl) {
        logger.debug(
          "Discord webhook URL not configured, skipping notification"
        );
        logFunctionCall(
          "DiscordService.sendNotification",
          { skipped: true },
          startTime
        );
        return;
      }

      logger.debug(`Sending Discord notification: ${title}`, {
        user: userEmail,
      });

      const embed = {
        title,
        description,
        color: 0x00ff00,
        fields: [
          ...fields,
          {
            name: "User",
            value: userEmail,
            inline: false,
          },
          {
            name: "Debug",
            value: config.discord.debug ? debugMessage : "DEBUG DISABLED",
            inline: false,
          },
        ],
        timestamp: new Date(),
        footer: {
          text: `Notification - ${config.NODE_ENV}`,
        },
      };

      const payload = {
        embeds: [embed],
        ...ping,
      };

      const response = await fetch(config.discord.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Discord API error: ${response.status} ${errorText}`);
      }

      logger.debug("Discord notification sent successfully");
      logFunctionCall(
        "DiscordService.sendNotification",
        { success: true },
        startTime
      );
    } catch (error) {
      logger.error("Failed to send Discord notification", {
        error: error.message,
        title,
        userEmail,
      });

      logFunctionError("DiscordService.sendNotification", error, startTime);
    }
  }

  async sendTransactionNotification(
    transaction,
    trackerType,
    userEmail,
    debugMessage
  ) {
    const title = `New ${
      trackerType.charAt(0).toUpperCase() + trackerType.slice(1)
    } Transaction Added`;
    const description = `Details of the transaction:`;
    const fields = [
      { name: "Date", value: transaction.date, inline: true },
      { name: "Amount", value: `€${transaction.amount}`, inline: true },
      { name: "Payee", value: transaction.payee_name, inline: false },
      { name: "Notes", value: transaction.notes || "None", inline: false },
    ];

    await this.sendNotification(
      title,
      description,
      fields,
      userEmail,
      debugMessage
    );
  }
}

export const discordService = new DiscordService();
