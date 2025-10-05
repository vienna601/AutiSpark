# AutiSpark

AI-powered learning companion for children with autism.

## Setup

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp client/.env.example client/.env
   ```
3. Fill in your API keys in `client/.env`
4. Install dependencies:
   ```bash
   cd client
   npm install
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

## Environment Variables

You'll need to obtain API keys for:
- Auth0 (for authentication)
- Google Gemini AI (for writing feedback)
- Tavus (for AI video conversations)

## Security Note

Never commit your `.env` files to version control. API keys should be kept secret.
