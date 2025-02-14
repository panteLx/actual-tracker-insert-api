import express from "express";
import bodyParser from "body-parser";
import api from "@actual-app/api";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Hilfsfunktion, um das aktuelle Datum im Format YYYY-MM-DD zu erhalten
function getCurrentDate() {
  return new Date().toISOString().split("T")[0];
}

// Initialisiere die Actual API und lade dein Budget
(async () => {
  try {
    await api.init({
      dataDir: process.env["ACTUAL_DATA_DIR"],
      serverURL: process.env["ACTUAL_URL"],
      password: process.env["ACTUAL_PW"],
    });
    await api.downloadBudget(process.env["ACTUAL_BUDGET_ID"]);
    app.listen(3000, "127.0.0.1", () => {
      console.log("Server läuft unter http://localhost:3000");
    });
  } catch (error) {
    console.error("Fehler beim Initialisieren der Actual API:", error);
  }
})();

// GET-Route: Formular anzeigen – modern, responsiv, mobile-first mit Darkmode
app.get("/", async (req, res) => {
  try {
    let payees = await api.getPayees();
    let categories = await api.getCategories();

    // Payee-Dropdown mit vorhandenen Payees und Option "Neuen Payee hinzufügen"
    let payeeOptions = payees
      .map((p) => `<option value="${p.id}">${p.name}</option>`)
      .join("");
    payeeOptions += `<option value="new">Neuen Teilnehmer hinzufügen</option>`;

    // Categories-Dropdown
    let categoryOptions = categories
      .map((c) => `<option value="${c.id}">${c.name}</option>`)
      .join("");

    // Anzeige einer Erfolgsmeldung (falls per Redirect gesendet)
    let successMessage = req.query.success
      ? "<p class='success'>Transaktion erfolgreich importiert!</p>"
      : "";

    let debugMessage = req.query.debug
      ? `<p class='debug'>Debug: ${req.query.debug}</p>`
      : "";

    // HTML-Code
    let html = `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Neuen Eintrag hinzufügen</title>
        <style>
          /* Reset und mobile-first Basis */
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
          /* Kennzeichnung von Pflichtfeldern */
          .required { color: red; margin-left: 4px; }
          .info {font-weight: normal; }
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
          /* Eingabegruppe für den Betrag */
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
          button:hover {
            background-color: #0056b3;
          }
          .success {
            background-color: #d4edda;
            color: #155724;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
            text-align: center;
          }
          /* Darkmode-Unterstützung */
          @media (prefers-color-scheme: dark) {
            body {
              background-color: #121212;
              color: #e0e0e0;
            }
            .container {
              background-color: #1e1e1e;
              box-shadow: 0 2px 6px rgba(0,0,0,0.5);
            }
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
            .input-group span {
              background: #444;
            }
            button {
              background-color: #0a84ff;
            }
            button:hover {
              background-color: #0066cc;
            }
            .success {
              background-color: #155724;
              color: #d4edda;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Neuen Eintrag hinzufügen</h2>
          ${successMessage}
          <form action="/" method="POST">
            <label>Datum <span class="required">*</span>:
              <input type="date" name="date" value="${getCurrentDate()}" required />
            </label>
            <label>Betrag <span class="required">*</span>:<br><span class="info"> -1.00€ = Ausgaben, 1.00€ = Einnahmen</span></label>
            <div class="input-group">
              <input type="number" name="amount" step="0.01" placeholder="0.00" required />
            </div>
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
          <script>
            const payeeSelect = document.getElementById('payeeSelect');
            const newPayeeDiv = document.getElementById('newPayeeDiv');
            payeeSelect.addEventListener('change', function() {
              newPayeeDiv.style.display = (this.value === 'new') ? 'block' : 'none';
            });
          </script>
        </div>
      </body>
      </html>
    `;
    res.send(html);
  } catch (error) {
    res.status(500).send("Fehler beim Abrufen der Daten: " + error.message);
  }
});

// POST-Route: Formularverarbeitung, Transaktion importieren und Discord-Benachrichtigung senden
app.post("/", async (req, res) => {
  try {
    let { date, amount, category, notes, payee_id, new_payee } = req.body;
    let payeeName = "";

    if (payee_id === "new" && new_payee && new_payee.trim() !== "") {
      payeeName = new_payee.trim();
    } else {
      let payees = await api.getPayees();
      let selected = payees.find((p) => p.id === payee_id);
      payeeName = selected ? selected.name : "Unbekannt";
    }

    // Betrag wird als Euro eingegeben – umrechnen in Cent (Ganzzahl)
    let euroBetrag = parseFloat(amount);
    let centBetrag = Math.round(euroBetrag * 100);

    let transaction = [
      {
        date: date,
        amount: centBetrag,
        category: category,
        notes: notes,
        payee_name: payeeName,
        imported_id: Math.random().toString(36).slice(2, 7),
        cleared: false,
      },
    ];

    let result = await api.importTransactions(
      process.env["ACTUAL_ACCOUNT_ID"],
      transaction
    );
    console.log("Import-Ergebnis:", result);
    let debugMessage = JSON.stringify(result);

    // Discord Webhook senden, falls eine URL definiert ist
    const discordWebhookUrl = process.env["DISCORD_WEBHOOK_URL"];
    if (discordWebhookUrl) {
      await fetch(discordWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `Neue Transaktion hinzugefügt:\nDatum: ${date}\nBetrag: €${euroBetrag.toFixed(
            2
          )}\nKategorie: ${category}\nPayee: ${payeeName}\nNotizen: ${notes}`,
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
