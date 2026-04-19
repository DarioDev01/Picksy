# ✦ Picksy — AI Shopping Advisor

> AI-powered shopping advisor that recommends Amazon products and earns affiliate commissions on autopilot.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Claude AI](https://img.shields.io/badge/Claude-Sonnet-D97706?style=flat-square)
![Amazon Associates](https://img.shields.io/badge/Amazon-Associates-FF9900?style=flat-square&logo=amazon)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## What is Picksy?

**Picksy** is a conversational AI shopping advisor built with React and Claude AI. Users describe what they want to buy, and the app instantly recommends specific products with real brand names, price ranges, and direct Amazon affiliate links — no manual curation needed.

Built as a passive income project: once deployed, the app runs itself. Every click that leads to a purchase on Amazon generates an affiliate commission automatically.

---

## How It Works

```
User types what they need
        ↓
Claude AI analyzes the request
        ↓
App returns 2–4 specific product recommendations
        ↓
User clicks → goes to Amazon with your affiliate tag
        ↓
User buys something → you earn 3–10% commission 💰
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| AI | Claude API (claude-sonnet-4) |
| Monetization | Amazon Associates (affiliate links) |
| Hosting | Vercel / Netlify (recommended) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com)
- An [Amazon Associates](https://affiliate-program.amazon.com) account

### 1. Clone the repository

```bash
git clone https://github.com/your-username/picksy.git
cd picksy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set your affiliate tag

Open `src/App.jsx` and replace the tag on line 3:

```js
const AFFILIATE_TAG = "your-tag-20"; // ← Replace with your Amazon Associates tag
```

Your tag looks like `yourname-20` and can be found in your Amazon Associates dashboard.

### 4. Configure your Anthropic API key

Create a `.env` file in the root of the project:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

> ⚠️ **Important:** Never commit your API key to GitHub. The `.env` file is already in `.gitignore`.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and start chatting.

---

## Deployment

### Deploy to Vercel (recommended — free)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add your environment variable `VITE_ANTHROPIC_API_KEY` in the Vercel dashboard
4. Click **Deploy** — your site will be live in under 2 minutes

### Deploy to Netlify (also free)

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and connect your repository
3. Set build command: `npm run build`, publish directory: `dist`
4. Add `VITE_ANTHROPIC_API_KEY` under **Site settings → Environment variables**
5. Deploy

---

## Earning Potential

| Daily visitors | Clicks | Estimated sales | Monthly earnings |
|---|---|---|---|
| 50 | 15 | 3–5 | $15–$50 |
| 200 | 60 | 12–20 | $60–$200 |
| 1,000 | 300 | 60–100 | $300–$1,000 |

*Commissions vary by product category (3–10%). Results depend on traffic and niche.*

---

## Driving Traffic (Optional)

The app runs itself — your only job is getting people to visit it. Some ideas:

- **SEO** — target keywords like "best [product] to buy" or "AI product recommendations"
- **Social media** — share use cases on Reddit, X, or TikTok
- **Niche communities** — post in Facebook groups or Discord servers related to your product category
- **Newsletter** — embed the tool link in a weekly deal digest

---

## Project Structure

```
picksy/
├── src/
│   └── App.jsx        # Main app — AI chat + affiliate links
├── public/
├── .env               # Your API key (not committed)
├── .gitignore
├── package.json
└── README.md
```

---

## License

MIT — free to use, modify, and deploy for personal or commercial projects.

---

## Disclaimer

This project uses the Amazon Associates program. Ensure your site complies with [Amazon's Associates Program Operating Agreement](https://affiliate-program.amazon.com/help/operating/agreement), including displaying a disclosure such as:

> *"As an Amazon Associate I earn from qualifying purchases."*
