# 📸 Vintage Digital Photobooth

A vintage-inspired digital photobooth experience with a 1970s-90s aesthetic. This application features a warm charcoal and gold design, interactive curtain animations, and a real-time multiplayer system for collaborative photo sessions.

## ✨ Features

-   **🎞️ Classic Aesthetic:** A nostalgic 1970s-90s vibe with a warm charcoal and gold color palette.
-   **🎭 Interactive Intro:** Custom curtain-opening animation on the landing page for an immersive start.
-   **👥 Multiplayer Rooms:** Synchronized sessions for up to 3 people using MQTT for cross-browser state management.
-   **🎲 Auto Mode:** A game-like feature that automatically triggers shots at intervals (3-10 seconds).
-   **✨ Vintage Filters:** Classic photo treatments including B&W and Sepia.
-   **🖼️ Customizable Layouts:** Choose between "Classic Print" or a "Film Strip" style with realistic rectangular sprocket holes.
-   **📥 High-Quality Exports:** Generate and download your photo strips as PNG files.

## 🚀 Tech Stack

-   **Frontend:** React 18 with [Vite](https://vitejs.dev/)
-   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
-   **Animation:** [Motion](https://motion.dev/) (formerly Framer Motion)
-   **Real-time Sync:** [MQTT](https://mqtt.org/) (via `mqtt` npm package)
-   **UI Components:** Radix UI primitives & Lucide Icons
-   **Routing:** React Router v7

## 🛠️ Getting Started

### Prerequisites

-   Node.js (v18 or higher recommended)
-   pnpm (recommended) or npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/vintage-photobooth.git
   cd vintage-photobooth
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 📖 Usage

1. **Enter the Booth:** Start at the home page and click through the curtain animation.
2. **Setup Your Session:** Choose the number of photos (1-6) and select your layout and filters.
3. **Join a Room (Optional):** Create or join a multiplayer room to sync your session with friends.
4. **Strike a Pose:** Use manual capture or "Auto Mode" for a hands-free experience.
5. **Download:** Once your strip is generated, download the PNG to keep the memories!

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
