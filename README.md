# ClarityHire

**No more uncertainties in job seeking and hiring**

ClarityHire is an **AI-powered recruitment and applicant tracking platform** that streamlines the entire hiring process for companies and simplifies job searching for candidates. More than just a job board, it provides comprehensive recruitment management tools including company management, application tracking, custom screening questions, and AI-assisted job description generation. Built with cutting-edge technologies, it delivers a seamless end-to-end experience for both recruiters and job seekers.

## 🌟 Features

### For Companies & Recruiters

- **Company Management**

  - Create and manage company profiles with custom branding
  - Company-specific URLs with unique slugs
  - Team member management with role-based access control (Admin, Recruiter, Hiring Manager, Member)

- **AI-Powered Job Posting**

  - Generate professional job descriptions using Google Gemini AI
  - Auto-generate job summaries, qualifications, and responsibilities
  - Save time with intelligent content generation

- **Job Management**

  - Create, edit, and manage job postings
  - Draft, publish, and archive jobs
  - Comprehensive job details including:
    - Salary ranges
    - Benefits packages
    - Required skills and qualifications
    - Work arrangement (On-site, Hybrid, Remote)
    - Experience levels (Internship to Principal)

- **Custom Application Questions**

  - Create company-specific questions for job applications
  - Support for multiple question types:
    - Text input
    - Multiple choice
    - Number input
    - Checkbox
    - True/False
  - Attach questions to specific job postings
  - Set required/optional questions

- **Application Tracking**
  - View and manage job applications
  - Track application status (Submitted, In Review, Interviewing, Offered, Rejected, Withdrawn, Hired)
  - Dashboard with statistics and insights

### For Job Seekers

- **Job Discovery**

  - Browse available jobs from multiple companies
  - Search and filter jobs by company, location, and more
  - View detailed job descriptions

- **Easy Application Process**

  - Simple application workflow
  - Upload and manage resumes
  - Answer custom questions during application
  - Track application status

- **Company Profiles**
  - Browse company listings
  - View company information and available positions
  - Access company-specific job pages

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Beautiful UI components
- **Redux Toolkit** - State management
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js** - Authentication and session management
- **Prisma** - Modern ORM
- **PostgreSQL** - Relational database
- **Google Gemini AI** - AI-powered content generation
- **Vercel Blob** - File storage for resumes

### Development Tools

- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Prisma Migrate** - Database migrations

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/clarityhire.git
   cd clarityhire
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/clarityhire"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"

   # Google Gemini AI
   GEMINI_API_KEY="your-gemini-api-key"

   # Vercel Blob (for resume storage)
   BLOB_READ_WRITE_TOKEN="your-blob-token"
   ```

4. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
clarityhire/
├── app/                    # Next.js App Router pages
│   ├── (authenticated)/    # Protected routes
│   │   ├── (applicant)/    # Job seeker routes
│   │   └── (recruiter)/    # Recruiter routes
│   ├── (public routes)/    # Public pages
│   └── api/                # API routes
├── components/             # React components
│   ├── App Sidebar/        # Navigation sidebar
│   ├── available-jobs/     # Job listing components
│   ├── companies/          # Company listing components
│   ├── recruiter/          # Recruiter dashboard components
│   └── ui/                 # Reusable UI components
├── lib/                    # Utility functions and configurations
│   ├── actions/            # Server actions
│   ├── auth.ts             # NextAuth configuration
│   └── redux slices/       # Redux state management
├── prisma/                 # Database schema and migrations
│   └── schema.prisma       # Prisma schema definition
└── types/                  # TypeScript type definitions
```

## 🔐 Authentication

ClarityHire uses NextAuth.js for authentication. The system supports:

- Email/password authentication
- OAuth providers (configurable)
- Session management
- Protected routes with middleware

## 📊 Database Schema

The application uses Prisma with PostgreSQL. Key models include:

- **User** - User accounts and profiles
- **Company** - Company information
- **CompanyMember** - Team member relationships
- **Job** - Job postings
- **Application** - Job applications
- **Resume** - User resumes
- **Question** - Custom application questions
- **ApplicationAnswer** - Answers to custom questions

## 🤖 AI Features

ClarityHire leverages Google Gemini AI to help recruiters:

- Generate professional job summaries
- Create comprehensive job qualifications
- Draft detailed job responsibilities
- Save time on content creation

## 🎨 UI/UX Features

- Modern, responsive design
- Smooth animations and transitions
- Loading states and skeletons
- Progress indicators
- Toast notifications
- Accessible components
- Mobile-friendly interface

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚢 Deployment

The easiest way to deploy ClarityHire is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables
4. Deploy!

For other deployment options, refer to the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- AI powered by [Google Gemini](https://deepmind.google/technologies/gemini/)

---

**ClarityHire** - Bringing clarity to the hiring process, one application at a time.
