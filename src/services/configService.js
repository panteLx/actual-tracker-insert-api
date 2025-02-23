import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_FILE = path.join(__dirname, "../config/settings.json");

class ConfigService {
  async loadSettings() {
    try {
      const data = await fs.readFile(CONFIG_FILE, "utf8");
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist or is invalid, return empty object
      return {};
    }
  }

  async saveSettings(settings) {
    try {
      await fs.mkdir(path.dirname(CONFIG_FILE), { recursive: true });
      await fs.writeFile(CONFIG_FILE, JSON.stringify(settings, null, 2));
    } catch (error) {
      console.error("Error saving settings:", error);
      throw error;
    }
  }

  async updateSetting(key, value) {
    const settings = await this.loadSettings();
    const keys = key.split(".");
    let current = settings;

    // Navigate through nested objects
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    await this.saveSettings(settings);
    return settings;
  }
}

export const configService = new ConfigService();
