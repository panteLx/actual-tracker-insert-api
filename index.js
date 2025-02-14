import express from "express";
import api from "@actual-app/api";
import fetch from "node-fetch";
import dotenv from "dotenv";
import helmet from "helmet";

dotenv.config({ path: ".env.local" });

const app = express();
app.use(express.static("public"));

// Sicherheits-Middleware
app.use(helmet());

// Express hat seit Version 4.16 eigene Parser-Middleware
app.use(express.urlencoded({ extended: true }));

// Hilfsfunktion: aktuelles Datum im Format YYYY-MM-DD
function getCurrentDate() {
  return new Date().toISOString().split("T")[0];
}

// Initialisiere die Actual API und starte den Server
(async () => {
  try {
    await api.init({
      dataDir: process.env.ACTUAL_DATA_DIR,
      serverURL: process.env.ACTUAL_URL,
      password: process.env.ACTUAL_PW,
    });
    await api.downloadBudget(process.env.ACTUAL_BUDGET_ID);
    app.listen(3000, "127.0.0.1", () => {
      console.log("Server läuft unter http://localhost:3000");
    });
  } catch (error) {
    console.error("Fehler beim Initialisieren der Actual API:", error);
    process.exit(1);
  }
})();

// GET-Route: Formularanzeige mit verbesserter UX
app.get("/", async (req, res) => {
  try {
    const payees = await api.getPayees();
    const categories = await api.getCategories();

    // Erstelle Payee-Dropdown: existierende Teilnehmer + Option "Neuen Teilnehmer hinzufügen"
    const payeeOptions =
      payees.map((p) => `<option value="${p.id}">${p.name}</option>`).join("") +
      `<option value="new">Neuen Teilnehmer hinzufügen</option>`;

    // Erstelle Categories-Dropdown
    const categoryOptions = categories
      .map((c) => `<option value="${c.id}">${c.name}</option>`)
      .join("");

    // Erfolgsmeldung und Debug-Informationen (aus Query-Parametern)
    const successMessage = req.query.success
      ? `<p class="success">Transaktion erfolgreich importiert!</p>`
      : "";
    const debugMessage = req.query.debug
      ? `<p class="debug">Debug: ${req.query.debug}</p>`
      : "";

    // HTML-Code (Für komplexere Layouts empfiehlt sich ein Template-Engine)
    const html = `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Neuen Eintrag hinzufügen</title>
        <style>
          /* Basis CSS: Reset, responsives Layout und Darkmode-Unterstützung */
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            padding: 20px;
            background-color: #f0f0f0;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          }
          h2 { margin-bottom: 20px; text-align: center; }
          label { display: block; margin-bottom: 10px; font-weight: bold; }
          .required { color: red; margin-left: 4px; }
          .info { font-weight: normal; }
          input[type="date"],
          input[type="number"],
          input[type="text"],
          select {
            width: 100%;
            padding: 8px 12px;
            margin-top: 4px;
            margin-bottom: 16px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 16px;
          }
          .input-group {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
          }
          .input-group span {
            padding: 8px 12px;
            background: #eee;
            border: 1px solid #ccc;
            border-right: none;
            border-radius: 4px 0 0 4px;
            font-size: 16px;
          }
          .input-group input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #ccc;
            border-radius: 0 4px 4px 0;
            font-size: 16px;
          }
          button {
            width: 100%;
            padding: 10px;
            border: none;
            border-radius: 4px;
            background-color: #007BFF;
            color: #fff;
            font-size: 16px;
            cursor: pointer;
          }
          button:hover { background-color: #0056b3; }
          .success {
            background-color: #d4edda;
            color: #155724;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
            text-align: center;
          }
          .debug {
            background-color: #d4edda;
            color:rgb(41, 41, 41);
            padding: 10px;
            margin-top: 20px;
            border-radius: 4px;
            text-align: center;
          }
          /* Darkmode-Unterstützung */
          @media (prefers-color-scheme: dark) {
            body { background-color: #121212; color: #e0e0e0; }
            .container { background-color: #1e1e1e; box-shadow: 0 2px 6px rgba(0,0,0,0.5); }
            input[type="date"],
            input[type="number"],
            input[type="text"],
            select,
            .input-group span,
            .input-group input {
              background-color: #333;
              border: 1px solid #555;
              color: #e0e0e0;
            }
            .input-group span { background: #444; }
            button { background-color: #0a84ff; }
            button:hover { background-color: #0066cc; }
            .success { background-color: #155724; color: #d4edda; }
            .debug { background-color: rgb(41, 41, 41); color: #d4edda; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Neuen Eintrag hinzufügen</h2>
          ${successMessage}
          <form action="/" method="POST" id="transactionForm">
            <label>Datum <span class="required">*</span>:
              <input type="date" name="date" value="${getCurrentDate()}" required />
            </label>
            <label>Betrag <span class="required">*</span>:<br>
              <span class="info"> -1.00€ = Ausgaben, 1.00€ = Einnahmen</span>
              <div class="input-group">
                <input type="number" name="amount" step="0.01" placeholder="0.00" required />
              </div>
            </label>
            <label>Kategorie <span class="required">*</span>:
              <select name="category" required>
                ${categoryOptions}
              </select>
            </label>
            <label>Notizen:
              <input type="text" name="notes" />
            </label>
            <label>Transaktionsteilnehmer <span class="required">*</span>:
              <select name="payee_id" id="payeeSelect" required>
                ${payeeOptions}
              </select>
            </label>
            <div id="newPayeeDiv" style="display:none;">
              <label>Neuer Teilnehmer:
                <input type="text" name="new_payee" placeholder="Neuen Teilnehmer eingeben" />
              </label>
            </div>
            <button type="submit">Eintrag hinzufügen</button>
          </form>
          ${debugMessage}
        </div>
        <script src="main.js?v=1.0"></script>

      </body>
      </html>
    `;
    res.send(html);
  } catch (error) {
    res.status(500).send("Fehler beim Abrufen der Daten: " + error.message);
  }
});

// POST-Route: Transaktionsverarbeitung, API-Import und Discord-Benachrichtigung
app.post("/", async (req, res) => {
  try {
    const { date, amount, category, notes, payee_id, new_payee } = req.body;
    let payeeName = "";

    // Bestimme den Namen des Teilnehmers
    if (payee_id === "new" && new_payee && new_payee.trim()) {
      payeeName = new_payee.trim();
    } else {
      const payees = await api.getPayees();
      const selected = payees.find((p) => p.id === payee_id);
      payeeName = selected ? selected.name : "Unbekannt";
    }

    // Umrechnung von Euro in Cent
    const euroBetrag = parseFloat(amount);
    const centBetrag = Math.round(euroBetrag * 100);

    // Erstelle die Transaktionsdaten
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

    // Discord Webhook senden, falls konfiguriert
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

// Sauberes Herunterfahren bei SIGINT (z. B. Strg+C)
process.on("SIGINT", async () => {
  await api.shutdown();
  process.exit();
});
