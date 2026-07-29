# Roast & Review Code

Roast & Review Code is an AI-powered code reviewer that playfully roasts your code while providing serious, genuinely helpful feedback. 
You can choose from different roast personalities (Gordon Ramsay, Shakespeare, Cyberpunk Hacker, etc.) and get an in-depth code review in Markdown format!

## Features
- **Dark Theme** with a modern, rounded UI.
- **Drag & Drop** or paste code directly.
- **Multiple Languages** supported with syntax highlighting.
- **Various Roast Styles** to match your preferred humor.
- **Export** your reviews by copying or downloading as Markdown.
- **Mobile Friendly** and accessible via keyboard shortcuts (Ctrl+Enter to submit).
- **Vanilla Frontend** powered by HTML, CSS (Tailwind) and TypeScript.

## Prerequisites

You will need a **Gemini API Key** to run this application. You can obtain one from Google AI Studio:
[https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/phew7o7/Roast-and-Review-code
   cd roast-review-code
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and replace `MY_GEMINI_API_KEY` with your actual Gemini API key.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` and start roasting your code!

## Architecture
- **Frontend:** Vanilla HTML, CSS, TypeScript (compiled by Vite). Tailwind CSS for styling.
- **Backend:** Express.js server running in Node.js to securely proxy requests to the Gemini API.

## License
[MIT](LICENSE)
