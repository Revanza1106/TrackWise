# Trackwise

A minimalist personal learning progress tracker that helps you stay consistent and accountable with your learning goals.

![Trackwise Logo](https://img.shields.io/badge/Trackwise-Learning%20Tracker-blue?style=for-the-badge)

## ✨ Features

- 🎯 **Goal Management** - Create and organize learning goals with status tracking (active/paused/done)
- 📊 **Progress Tracking** - Log detailed progress with notes, hours spent, and timestamps
- 📈 **Statistics Dashboard** - View comprehensive statistics including total hours, progress count, and activity dates
- 🤖 **AI-Powered Insights** - Get personalized learning advice and progress analysis using OpenAI
- 🔮 **Smart Progress Analysis** - Automatic percentage calculation, trend detection, and consistency tracking
- 💡 **Intelligent Recommendations** - AI-generated suggestions based on your learning patterns and progress data
- 🎨 **Modern UI** - Clean, responsive design built with Tailwind CSS
- 🚀 **Real-time Updates** - Instant feedback when adding progress or updating goals
- 💾 **Local Data Storage** - SQLite database for fast, reliable local data storage

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Database**: SQLite with Prisma ORM
- **AI Integration**: OpenAI API for intelligent insights
- **Styling**: Tailwind CSS
- **State Management**: Server Actions + React state
- **Development**: TypeScript, ESLint

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Revanza1106/TrackWise.git
   cd TrackWise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Add your OpenAI API key for AI features:
   ```env
   DATABASE_URL="file:./dev.db"
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Creating Goals

1. Click "New Goal" in the header
2. Fill in the goal details:
   - **Title** (required): What you want to learn
   - **Description** (optional): Additional details about your goal
   - **Status**: active, paused, or done
3. Click "Create Goal"

### Logging Progress

1. Click on any goal from the dashboard
2. In the "Add Progress" section:
   - **Note** (required): What you worked on
   - **Hours** (optional): How much time you spent
   - **Date**: When you did the work (defaults to today)
3. Click "Add Progress"

### Tracking Statistics

Each goal displays:
- **Total Entries**: Number of progress logs
- **Total Hours**: Cumulative time spent
- **Last Activity**: Most recent progress date
- **Status**: Current goal state

### AI-Powered Insights

Trackwise leverages AI to enhance your learning experience:

- **Progress Analysis**: Automatic calculation of completion percentage, learning consistency, and progress trends
- **Personalized Advice**: AI-generated recommendations based on your learning patterns
- **Smart Recommendations**: Actionable tips to improve consistency and achieve goals faster
- **Trend Detection**: Identifies if your learning is improving, stable, or needs attention

To get AI insights, visit any goal detail page and view the "Progress Analysis" section.

## 🏗️ Project Structure

```
TrackWise/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── actions/           # Server actions for CRUD
│   │   ├── goals/            # Goal-related pages
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home dashboard
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── GoalForm.tsx      # Goal creation/edit form
│   │   ├── Header.tsx        # Navigation header
│   │   └── ProgressForm.tsx  # Progress logging form
│   ├── lib/
│   │   └── prisma.ts         # Database client
│   └── types/
│       └── index.ts          # TypeScript types
├── public/                   # Static assets
└── README.md
```

## 🗃️ Database Schema

Trackwise uses a simple two-table schema:

```prisma
model Goal {
  id          Int           @id @default(autoincrement())
  title       String
  description String?
  status      String        // active | paused | done
  createdAt   DateTime      @default(now())
  progress    ProgressLog[]
}

model ProgressLog {
  id        Int      @id @default(autoincrement())
  goalId    Int
  date      DateTime
  note      String
  hours     Float?
  goal      Goal     @relation(fields: [goalId], references: [id], onDelete: Cascade)
}
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `npm run test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Add TypeScript types for new components
- Include comments for complex logic
- Test your changes thoroughly
- Keep the UI clean and minimalist

## 🐛 Troubleshooting

### Database Issues

If you encounter database errors:

1. **Reset the database**:
   ```bash
   rm dev.db
   npx prisma migrate dev
   ```

2. **Regenerate Prisma client**:
   ```bash
   npx prisma generate
   ```

### Port Already in Use

If port 3000 is occupied:

1. **Kill existing processes**:
   ```bash
   pkill -f "next dev"
   ```

2. **Or use a different port**:
   ```bash
   npm run dev -- -p 3001
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Claude](https://claude.ai/) - AI assistant for development

## 📞 Support

If you have any questions or issues:

- Open an [Issue](https://github.com/Revanza1106/TrackWise/issues)
- Check the [Wiki](https://github.com/Revanza1106/TrackWise/wiki) for documentation
- Join our [Discussions](https://github.com/Revanza1106/TrackWise/discussions)

---

**Trackwise** - Stay consistent, track progress, achieve your learning goals! 🎯✨
