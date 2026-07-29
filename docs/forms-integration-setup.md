# Forms integration setup: Turnstile CAPTCHA + Google Sheet delivery

Both pieces are opt-in via environment variables — the site works exactly
as it did before (validated, honeypot-protected, no CAPTCHA, no delivery)
until you configure them. Neither integration needs credentials to be
shared with anyone outside your own Cloudflare and Google accounts; you do
all of the setup below yourself.

## 1. Cloudflare Turnstile (CAPTCHA)

Turnstile is Cloudflare's CAPTCHA replacement — free and privacy-respecting.
This site itself deploys as a self-hosted Docker/AWS container (see
`docs/deployment.md`), not Cloudflare Workers — Turnstile is used purely as
a hosted CAPTCHA service here, independent of where the site runs.

1. Go to the [Cloudflare dashboard](https://dash.cloudflare.com/) → **Turnstile**.
2. **Add a site.** Enter your domain (`kingdomimpactventures.org`), and add
   `localhost` too if you want the widget to render in local dev.
3. Choose the **Managed** challenge type (invisible-first, falls back to an
   interactive challenge only if needed — the least friction for real
   visitors).
4. Copy the **Site Key** and **Secret Key** it gives you.
5. Set:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = the Site Key (this one is meant to
     be public — it ships to the browser).
   - `TURNSTILE_SECRET_KEY` = the Secret Key (server-only — set this as a
     secret/environment variable on whichever host actually runs the
     container: an AWS Secrets Manager entry injected into the task
     definition, a `.env` file outside version control read by Docker
     Compose, or your Vercel/host's environment-variables panel if you use
     that path instead. Never bake it into the Docker image itself.)

Once both are set, every `PublicForm` on the site (`/contact`,
`/partners`, `/investors`, `/download`, `/security`,
`/account-deletion`, `/data-deletion`) automatically renders the widget and
the API route (`app/api/forms/route.ts`) rejects any submission whose
token doesn't verify against Cloudflare's `siteverify` endpoint.

## 2. Google Sheet delivery (via Apps Script — no service account needed)

This deliberately avoids the Google Sheets API + service-account route,
which would require generating a credential file and deciding where to
store it. Instead, a small Apps Script bound to your own sheet exposes a
webhook URL that only your own Google account ever controls.

### a. Add the script to your sheet

1. Open your sheet:
   `https://docs.google.com/spreadsheets/d/1Khnfalxc_5NoMPaEnJxQgWbSb3WgKwSiko4YHIAtoVc/edit`
2. **Extensions → Apps Script.**
3. Delete the placeholder code and paste this in:

   ```javascript
   const SHEET_NAME = "Form Submissions";
   // Set this to a long random string YOU choose. It must match
   // KIV_FORM_WEBHOOK_SECRET exactly — it's how the script tells a real
   // request from this site apart from anyone else who discovers the URL.
   const EXPECTED_SECRET = "REPLACE_WITH_A_LONG_RANDOM_SECRET";

   function doPost(e) {
     try {
       const data = JSON.parse(e.postData.contents);
       if (data.secret !== EXPECTED_SECRET) {
         return jsonResponse({ ok: false, error: "unauthorized" });
       }

       const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
       const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

       if (sheet.getLastRow() === 0) {
         sheet.appendRow(["Submitted At", "Kind", "Name", "Email", "Organisation", "Subject", "Product", "Message"]);
       }

       sheet.appendRow([
         data.submittedAt || new Date().toISOString(),
         data.kind || "",
         data.name || "",
         data.email || "",
         data.organisation || "",
         data.subject || "",
         data.product || "",
         data.message || "",
       ]);

       return jsonResponse({ ok: true });
     } catch (error) {
       return jsonResponse({ ok: false, error: String(error) });
     }
   }

   function jsonResponse(body) {
     return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
   }
   ```

4. Replace `REPLACE_WITH_A_LONG_RANDOM_SECRET` with a long random string of
   your own choosing (a password generator's output is fine — it never
   needs to be memorable, just unguessable).
5. **Save** the project (give it a name like "KIV form webhook").

### b. Deploy it as a Web App

1. **Deploy → New deployment.**
2. Click the gear icon next to "Select type" → **Web app**.
3. Set **Execute as**: "Me" (your account).
4. Set **Who has access**: "Anyone" — this is required for the site's
   server to be able to POST to it without a Google login of its own; the
   shared secret in the script is what actually protects it, not Google's
   access control.
5. Click **Deploy**. The first time, Google will ask you to authorize the
   script (it's acting on your own sheet, on your own behalf) — approve it.
6. Copy the **Web app URL** it gives you (ends in `/exec`).

### c. Configure the site

Set:
- `KIV_FORM_WEBHOOK_URL` = the Web app URL from step b.6.
- `KIV_FORM_WEBHOOK_SECRET` = the exact same string you put in
  `EXPECTED_SECRET` in step a.4.

From then on, every validated, CAPTCHA-verified submission appends a row
to a "Form Submissions" tab in that sheet (created automatically on first
submission), with columns for timestamp, request kind (contact / partner /
investor / launch / deletion / security), name, email, organisation,
subject, product, and message.

### Updating the script later

If you ever change the Apps Script code, you need to **Deploy → Manage
deployments → edit (pencil icon) → New version → Deploy** for the change
to take effect — saving the script alone does not update the live Web
app.
