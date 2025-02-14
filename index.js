import express from "express";
import api from "@actual-app/api";
import fetch from "node-fetch";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = `.env.${process.env.NODE_ENV || "development"}`;

// Laden Sie die Umgebungsvariablen aus der spezifischen .env-Datei
dotenv.config({ path: path.resolve(__dirname, envFile) });

const app = express();

// Statische Dateien aus dem public-Ordner bereitstellen
app.use(express.static(path.join(__dirname, "public")));

// Sicherheits-Middleware
app.use(helmet());

// Express-eigene Parser-Middleware
app.use(express.urlencoded({ extended: true }));

// EJS als Template-Engine konfigurieren
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Hilfsfunktion: aktuelles Datum im Format YYYY-MM-DD
const getCurrentDate = () => new Date().toISOString().split("T")[0];

// Helper-Funktion: Ermittelt den letzten Änderungszeitpunkt der Datei und formatiert ihn als Version
function getFileVersion(filePath) {
  try {
    const stats = fs.statSync(filePath);
    // Formatierung: JahrMonatTag-StundenMinutenSekunden (z.B. v20250214-153045)
    const mtime = new Date(stats.mtime);
    const version =
      "v" +
      mtime.getFullYear() +
      ("0" + (mtime.getMonth() + 1)).slice(-2) +
      ("0" + mtime.getDate()).slice(-2) +
      "-" +
      ("0" + mtime.getHours()).slice(-2) +
      ("0" + mtime.getMinutes()).slice(-2) +
      ("0" + mtime.getSeconds()).slice(-2);
    return version;
  } catch (err) {
    return "v1.0";
  }
}

const jsPath = path.join(__dirname, "public/js/main.js");
const cssPath = path.join(__dirname, "public/css/style.css");
const jsVersion = getFileVersion(jsPath);
const cssVersion = getFileVersion(cssPath);

// Initialisiere die Actual API und starte den Server
(async () => {
  try {
    await api.init({
      dataDir: process.env.ACTUAL_DATA_DIR,
      serverURL: process.env.ACTUAL_URL,
      password: process.env.ACTUAL_PW,
    });
    await api.downloadBudget(process.env.ACTUAL_BUDGET_ID);
    app.listen(
      process.env.PORT || 3000,
      process.env.HOST || "127.0.0.1",
      () => {
        console.log(
          process.env.NODE_ENV +
            " - Server läuft unter http://" +
            process.env.HOST +
            ":" +
            process.env.PORT
        );
      }
    );
  } catch (error) {
    console.error("Fehler beim Initialisieren der Actual API:", error);
    process.exit(1);
  }
})();

// GET-Route: Formularanzeige mit verbesserter UX und Versionierung der Assets
app.get("/", async (req, res) => {
  try {
    const payees = await api.getPayees();
    const categories = await api.getCategories();

    res.render("index", {
      currentDate: getCurrentDate(),
      payees,
      categories,
      success: req.query.success,
      debug: req.query.debug,
      jsVersion,
      cssVersion,
    });
  } catch (error) {
    res.status(500).send("Fehler beim Abrufen der Daten: " + error.message);
  }
});

// POST-Route: Transaktionsverarbeitung, API-Import und Discord-Benachrichtigung
app.post("/", async (req, res) => {
  try {
    const { date, amount, category, notes, payee_id, new_payee } = req.body;
    let payeeName = "";

    if (payee_id === "new" && new_payee && new_payee.trim()) {
      payeeName = new_payee.trim();
    } else {
      const payees = await api.getPayees();
      const selected = payees.find((p) => p.id === payee_id);
      payeeName = selected ? selected.name : "Unbekannt";
    }

    const euroBetrag = parseFloat(amount);
    const centBetrag = Math.round(euroBetrag * 100);

    const transaction = [
      {
        date,
        amount: centBetrag,
        category,
        notes,
        payee_name: payeeName,
        imported_id: Math.random().toString(36).slice(2, 7),
        cleared: true,
      },
    ];

    const result = await api.importTransactions(
      process.env.ACTUAL_ACCOUNT_ID,
      transaction
    );
    console.log("Import-Ergebnis:", result);
    const debugMessage = JSON.stringify(result);

    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhookUrl) {
      await fetch(discordWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `Neue Transaktion hinzugefügt:
Datum: ${date}
Betrag: €${euroBetrag.toFixed(2)}
Kategorie: ${category}
Payee: ${payeeName}
Notizen: ${notes}`,
        }),
      });
    }

    res.redirect("/?success=1&debug=" + encodeURIComponent(debugMessage));
  } catch (error) {
    res
      .status(500)
      .send("Fehler beim Importieren der Transaktion: " + error.message);
  }
});

// Sauberes Herunterfahren bei SIGINT (z. B. Strg+C)
process.on("SIGINT", async () => {
  await api.shutdown();
  process.exit();
});
