# ⏳ Dynamic Life Calendar Wallpaper

A dynamic, auto-updating "Life in Weeks/Years" lock screen wallpaper generator built with Next.js and `@vercel/og`. Designed to help you visualize your time and practice Stoic reflection daily.

## ✨ Features
* **Dynamic Image Generation:** Creates a high-resolution image on the fly using Vercel Edge Functions.
* **Lifetime Grid (80 Years):** Visualizes your life progress. 1 split-circle represents 2 years. Past years are filled, the current year is highlighted in orange, and future years are dimmed.
* **Current Year Grid:** Displays 365 (or 366) days to track your progress within the current year.
* **Timezone Accurate:** Hardcoded to GMT+7 (Asia/Bangkok) to ensure the day rolls over at exactly midnight local time, not UTC.
* **Daily Auto-Refresh:** Cache is disabled by default, ensuring your iOS Shortcut always fetches the latest data every morning.
* **Customizable Resolution:** Pass `width` and `height` via URL parameters to perfectly fit any smartphone screen.

## 🛠️ Tech Stack
* Next.js (App Router)
* `@vercel/og` (Satori)
* TypeScript / React

## 🚀 Getting Started (Local Development)

1. **Clone the repository and install dependencies:**
   ```bash
   npm install