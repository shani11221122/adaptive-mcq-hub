# MDCAT App - Libraries & APIs Documentation

## Core Framework

| Library | Version | Purpose |
|---------|---------|---------|
| React | 18.x | UI component library |
| TypeScript | 5.x | Type safety & developer experience |
| Vite | 5.x | Build tool & development server |
| Tailwind CSS | 3.x | Utility-first CSS framework |

## UI Components & Styling

| Library | Purpose |
|---------|---------|
| shadcn/ui | Accessible UI component primitives (built on Radix UI) |
| Radix UI | Headless accessible components (Dialog, Dropdown, Tabs, Toast, etc.) |
| Framer Motion | Animations & transitions |
| Lucide React | Icon library |
| next-themes | Dark/light mode theming |

## State & Data Management

| Library | Purpose |
|---------|---------|
| React Router DOM | Client-side routing |
| TanStack Query (React Query) | Server state caching & synchronization |
| React Hook Form | Form state management |
| Zod | Schema validation |

## Charts & Visualization

| Library | Purpose |
|---------|---------|
| Recharts | Analytics charts (PieChart, BarChart, LineChart, AreaChart) |

## Mobile App (Android APK)

| Library | Purpose |
|---------|---------|
| @capacitor/core | Native mobile app wrapper |
| @capacitor/android | Android platform |
| @capacitor/app | App lifecycle events |
| @capacitor/clipboard | Clipboard access |
| @capacitor/device | Device info |
| @capacitor/filesystem | File system access |
| @capacitor/haptics | Haptic feedback |
| @capacitor/keyboard | Keyboard handling |
| @capacitor/network | Network status |
| @capacitor/preferences | Key-value storage |
| @capacitor/share | Native share dialog |
| @capacitor/splash-screen | Splash screen |
| @capacitor/status-bar | Status bar styling |
| @capacitor/toast | Native toast notifications |

## Utilities

| Library | Purpose |
|---------|---------|
| canvas-confetti | Celebration/confetti effects |
| date-fns | Date formatting & manipulation |
| embla-carousel-react | Carousel/slider component |
| sonner | Toast notification system |
| clsx + tailwind-merge | Conditional class name utilities |

## Testing

| Library | Purpose |
|---------|---------|
| Vitest | Unit testing framework |
| @testing-library/react | React component testing |
| @testing-library/jest-dom | DOM assertion helpers |

## Linting & Dev Tools

| Library | Purpose |
|---------|---------|
| ESLint | Code linting |
| @typescript-eslint/* | TypeScript ESLint plugins |
| @eslint/js | Core ESLint rules |
| globals | Global variable definitions |

---

## APIs & Backend Services

### Lovable Cloud (Supabase)

| Service | Usage |
|---------|-------|
| PostgreSQL Database | Questions, quiz results, subscriptions, profiles, mock progress |
| Authentication | Email/password & Google OAuth |
| Row Level Security | Data access policies per user role |
| Realtime | (Available for future live features) |

### Client-Side Storage (IndexedDB / localStorage)

| Storage | Key | Data Stored |
|---------|-----|-------------|
| IndexedDB (`mdcat_quiz_db`) | `questions` | Custom imported MCQs |
| IndexedDB | `mock_progress` | Auto-saved mock test state |
| IndexedDB | `subscriptions` | Subscription records |
| localStorage | `mdcat_session` | Active user session (30-day sliding expiry) |
| localStorage | `mdcat_users` | Local user accounts (legacy) |
| localStorage | `mdcat_premium_code` | Premium unlock code |
| localStorage | `mdcat_admin_creds` | Admin credentials |
| localStorage | `mdcat_quiz_history` | Quiz result history |
| localStorage | `mdcat_seen_pool` | Seen question IDs for deduplication |

### Browser Web APIs

| API | Usage |
|-----|-------|
| IndexedDB API | Offline question bank, mock progress, subscriptions |
| LocalStorage API | Session persistence, user data, config |
| Battery Status API | Battery-aware UI hints |
| Online/Offline API | Network status detection |
| Clipboard API | Copy/share functionality |
| Fullscreen API | Mock test focus mode |

### External APIs

| API | Status | Purpose |
|-----|--------|---------|
| Lovable AI Gateway | Available | AI-powered features (future) |

---

## MCQ Import JSON Format

### Envelope Format (Recommended)

```json
{
  "version": 1,
  "exportedAt": "2025-01-15T10:30:00.000Z",
  "count": 2,
  "questions": [
    {
      "id": "q_bio_001",
      "subject": "biology",
      "question": "What is the powerhouse of the cell?",
      "options": ["Nucleus", "Mitochondria", "Ribosome", "Golgi body"],
      "correctAnswer": 1,
      "difficulty": "easy"
    }
  ]
}
```

### Bare Array Format (Legacy)

```json
[
  {
    "subject": "physics",
    "question": "Force equals mass times ___?",
    "options": ["Velocity", "Acceleration", "Time", "Distance"],
    "correctAnswer": 1,
    "difficulty": "intermediate"
  }
]
```

### Validation Rules

| Field | Type | Constraints |
|-------|------|-------------|
| `subject` | string | One of: `biology`, `chemistry`, `physics`, `english`, `reasoning` |
| `difficulty` | string | One of: `easy`, `intermediate`, `hard` |
| `question` | string | 3-2000 characters |
| `options` | array | Exactly 4 non-empty strings |
| `correctAnswer` | integer | 0, 1, 2, or 3 (index into options) |
| `id` | string | Optional; auto-generated if missing |

---

## Database Schema (Lovable Cloud)

### Tables

#### `profiles`
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `username` (text, unique)
- `email` (text)
- `is_premium` (boolean)
- `is_admin` (boolean)
- `avatar_url` (text)
- `created_at`, `updated_at` (timestamptz)

#### `questions`
- `id` (text, PK)
- `subject` (subject_enum)
- `question` (text)
- `options` (text[])
- `correct_answer` (integer, 0-3)
- `difficulty` (difficulty_enum)
- `created_at`, `updated_at` (timestamptz)

#### `quiz_results`
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `subject`, `difficulty` (enums)
- `correct_count`, `incorrect_count`, `total_questions`
- `score_percent`, `time_taken_seconds`
- `answers` (jsonb), `question_ids` (text[])
- `created_at` (timestamptz)

#### `subscriptions`
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `plan`, `method`, `reference`
- `amount` (numeric), `start_date`, `expiry_date`
- `is_active` (boolean)
- `created_at`, `updated_at` (timestamptz)

#### `mock_progress`
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `questions` (jsonb), `answers` (integer[])
- `current_index`, `seconds_left`
- `saved_at`, `updated_at` (timestamptz)

#### `admin_settings`
- `id` (uuid, PK)
- `key` (text, unique)
- `value` (jsonb)
- `created_at`, `updated_at` (timestamptz)

---

## File Structure

```
project/
├── public/              # Static assets, manifest, PWA files
├── src/
│   ├── components/      # React components (UI + Admin)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Core logic (auth, DB, schema, questions)
│   ├── pages/           # Route-level page components
│   └── test/            # Unit tests
├── supabase/
│   ├── migrations/      # SQL schema migrations
│   ├── seed.sql         # Sample data
│   └── README.md        # Backend docs
├── capacitor.config.json  # Mobile app config
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## Authentication Flow

1. User signs up/logs in via email/password or Google OAuth
2. Supabase Auth creates session with JWT tokens
3. `handle_new_user` trigger auto-creates profile row
4. Frontend stores session in localStorage with 30-day sliding expiry
5. Admin login uses separate credentials stored in `admin_settings` table

## Quiz Flow

1. User selects subject & difficulty on `/quiz`
2. Questions fetched from IndexedDB + hardcoded bank (deduplicated)
3. Fisher-Yates shuffle + seen-pool deduplication ensures fresh questions
4. Answers tracked in component state, saved to localStorage on completion
5. Results stored in `quiz_results` table (if logged in) or localStorage

## Mock Test Flow

1. User starts mock test on `/mock-test`
2. 200 questions across all subjects auto-generated
3. Progress auto-saved to `mock_progress` table every 30 seconds
4. On submit, results saved and progress cleared

## Admin Dashboard

- Protected by `AdminRoute` component
- Admin users can: manage questions (CRUD), view analytics (Recharts), manage users, set premium codes, bulk import/export MCQs
