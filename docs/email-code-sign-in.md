# Email code sign-in: Supabase setup

The site can sign people in with a 6-digit code from their email, and new accounts are confirmed the same way. The code only arrives if the Supabase project is set up as below.

## 1. Resume the project

Free-plan projects are paused after about a week without database activity. Open the Supabase dashboard, select the project and click **Resume project**. Data and settings come back as they were.

## 2. Set up custom SMTP (required)

Supabase's built-in email sender only delivers to members of your Supabase organization and allows very few emails per hour. On the free plan you also can't edit email templates without your own SMTP. For a public competition, connect a provider (Resend, Brevo, SendGrid, Amazon SES or similar):

**Authentication → Emails → SMTP Settings** → enable custom SMTP and enter the provider's host, port, username, password and sender address.

Then raise **Authentication → Rate Limits → emails per hour** to a level that fits expected sign-ups.

## 3. Put the code in the email templates

In **Authentication → Emails → Templates**:

| Template | Subject | Body |
|---|---|---|
| Magic Link | Your Research Bridge sign-in code | contents of `supabase/templates/magic_link.html` |
| Confirm signup | Confirm your Research Bridge account | contents of `supabase/templates/confirmation.html` |

The `{{ .Token }}` placeholder is what makes Supabase send a code. The sign-up email also keeps the one-click link.

## 4. Check the URLs

In **Authentication → URL Configuration**, set **Site URL** to the live site (e.g. `https://julafrll.github.io/Research_Bridge/`) and add it, plus `http://localhost:5173/**` for local dev, to **Redirect URLs**.

## How it works in the code

- `AuthContext.sendLoginCode` calls `signInWithOtp` with `shouldCreateUser: false`, so only registered accounts can sign in this way. New participants still register first, which collects their name.
- `AuthContext.verifyEmailCode` calls `verifyOtp({ type: 'email' })`. That type accepts both the sign-in code and the sign-up confirmation code.
- A user can request a new code once every 60 seconds. Codes expire after one hour, and only the newest code works.
