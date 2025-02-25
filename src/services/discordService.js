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

  async sendTransactionNotification(
    transaction,
    trackerType,
    userEmail,
    debugMessage
  ) {
    const startTime = logFunctionCall(
      "DiscordService.sendTransactionNotification",
      {
        trackerType,
        userEmail,
        transaction: config.debug ? transaction : "hidden in non-debug mode",
      }
    );

    try {
      if (!config.discord.webhookUrl) {
        logger.debug(
          "Discord webhook URL not configured, skipping notification"
        );
        logFunctionCall(
          "DiscordService.sendTransactionNotification",
          { skipped: true },
          startTime
        );
        return;
      }

      logger.debug(
        `Sending Discord notification for ${trackerType} transaction`,
        {
          amount: transaction.amount,
          payee: transaction.payee_name,
          user: userEmail,
        }
      );

      const embed = {
        title: `New ${
          trackerType.charAt(0).toUpperCase() + trackerType.slice(1)
        } Transaction Added`,
        color: 0x00ff00,
        fields: [
          { name: "Date", value: transaction.date, inline: true },
          {
            name: "Amount",
            value: `€${transaction.amount}`,
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
          } Tracker - ${config.NODE_ENV}`,
        },
      };

      const response = await fetch(config.discord.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Discord API error: ${response.status} ${errorText}`);
      }

      logger.debug("Discord notification sent successfully");
      logFunctionCall(
        "DiscordService.sendTransactionNotification",
        { success: true },
        startTime
      );
    } catch (error) {
      logger.error("Failed to send Discord notification", {
        error: error.message,
        trackerType,
        userEmail,
      });

      logFunctionError(
        "DiscordService.sendTransactionNotification",
        error,
        startTime
      );
      // Don't rethrow - we don't want to fail the transaction if Discord notification fails
    }
  }
}

export const discordService = new DiscordService();
