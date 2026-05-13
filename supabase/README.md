# MDCAT Preparation App - Supabase Backend

## Overview

This folder contains the Lovable Cloud (Supabase) backend configuration for the MDCAT Preparation App.

## Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles extending auth.users |
| `questions` | MCQ question bank (Biology, Chemistry, Physics, English, Reasoning) |
| `quiz_results` | Stores quiz attempt results per user |
| `subscriptions` | Premium subscription records |
| `mock_progress` | Auto-saved mock test progress |
| `admin_settings` | Admin configuration (premium codes, app settings) |

### Enums

- `subject_enum`: `biology`, `chemistry`, `physics`, `english`, `reasoning`
- `difficulty_enum`: `easy`, `intermediate`, `hard`

### Security

- Row Level Security (RLS) enabled on all tables
- Questions are publicly readable
- Only admins can insert/update/delete questions
- Users can only access their own quiz results, subscriptions, and mock progress
- Admin settings restricted to admin users only

### Triggers

- `handle_new_user()`: Auto-creates a profile when a new user signs up
- `update_updated_at_column()`: Auto-updates timestamps on all tables

## File Structure

```
supabase/
├── migrations/           # SQL migration files (auto-generated timestamps)
├── seed.sql             # Sample MCQ data for all 5 subjects
├── config.toml          # Supabase project configuration
└── README.md            # This file
```

## How to Use

### Apply Migrations
Migrations are automatically applied by the Lovable Cloud system.

### Seed Data
After migrations, seed data can be loaded to populate sample questions:

```bash
# Using psql (requires DB password)
psql -h <host> -U postgres -d postgres -f supabase/seed.sql
```

Or run the SQL directly via the Cloud Dashboard query editor.

### MCQ Import Format

The app accepts JSON files for bulk question import:

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

**Rules:**
- `subject`: one of `biology`, `chemistry`, `physics`, `english`, `reasoning`
- `difficulty`: `easy`, `intermediate`, or `hard`
- `options`: exactly 4 non-empty strings
- `correctAnswer`: integer 0 to 3 (index of correct option)

## Authentication

- Email/Password authentication via Lovable Cloud Auth
- Google Sign-In supported
- User profiles auto-created on signup via trigger

## Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_questions_subject` | `subject` | Filter questions by subject |
| `idx_questions_difficulty` | `difficulty` | Filter by difficulty |
| `idx_questions_subject_difficulty` | `subject, difficulty` | Combined filtering |
| `idx_quiz_results_user_id` | `user_id` | User history lookup |
| `idx_subscriptions_user_id` | `user_id` | Subscription lookup |
| `idx_mock_progress_user_id` | `user_id` | Progress retrieval |

## Related Frontend Files

- `src/lib/indexeddb.ts` - Client-side IndexedDB (legacy fallback)
- `src/lib/quiz-schema.ts` - Question validation (Zod schema)
- `src/lib/auth-context.tsx` - Auth context (migrating to Supabase Auth)
