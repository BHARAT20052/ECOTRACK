# EcoTrack - Carbon Footprint Awareness Platform

A full-stack web application designed to help individuals understand, track, and reduce their carbon footprint through simple actions and personalized insights. Built for Hack2Skill Challenge 3.

## Features
- **Carbon Footprint Calculator**: Calculate emissions from transport, food, energy, and shopping.
- **Eco Actions**: Log sustainable actions to offset emissions.
- **AI Assistant**: Personalized advice and tips powered by Google Gemini.
- **Dashboard**: Track your progress with interactive charts and insights.
- **Goals & Badges**: Set monthly targets, maintain streaks, and earn achievements.
- **Accessibility**: Built with a11y in mind, including keyboard navigation, ARIA attributes, and screen reader support.

## Tech Stack
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Recharts, React Hook Form, Zod.
- **Backend**: Node.js, Express, TypeScript, Firebase Admin.
- **Database & Auth**: Firebase Firestore, Firebase Authentication.
- **AI**: Google Gemini API.
- **Testing**: Vitest, React Testing Library, Jest, Supertest.

## Setup Instructions

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd carbon-footprint-platform
   \`\`\`

2. **Frontend Setup**
   \`\`\`bash
   npm install
   cp .env.example .env.local
   # Fill in your Firebase config in .env.local
   npm run dev
   \`\`\`

3. **Backend Setup**
   \`\`\`bash
   cd server
   npm install
   cp .env.example .env
   # Fill in your Gemini API key and Firebase Admin credentials in .env
   npm run dev
   \`\`\`

## Testing
- **Frontend**: `npm run test` or `npm run test:coverage`
- **Backend**: `cd server && npm run test` or `npm run test:coverage`

## License
MIT
