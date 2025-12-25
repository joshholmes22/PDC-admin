# Palace Drum Clinic - Admin Dashboard Setup Guide

## Overview

This guide outlines the setup for a separate admin web dashboard to manage:

- 📱 **Push Notifications** (scheduling, analytics)
- 🎥 **Content Management** (video upload, series management)
- 📊 **Analytics** (user engagement, video performance)
- 👥 **User Management** (view users, manage subscriptions)
- 🎯 **Goals & Challenges** (create/manage goals)
- 📅 **Drum Zone Bookings** (calendar management)

---

## Tech Stack Recommendation

### Option 1: Next.js (Recommended)

**Best for**: Full-featured admin dashboard with great DX

```
Tech Stack:
- Next.js 14+ (App Router)
- TypeScript
- Supabase JS Client (same backend!)
- Shadcn/ui or MUI for components
- TanStack Table for data tables
- Recharts for analytics
- React Hook Form + Zod (same validation!)
- Vercel for deployment
```

**Pros**:

- Fast development with App Router
- Great file upload handling
- Excellent TypeScript support
- Easy deployment to Vercel
- Can reuse your Zod schemas
- Server-side rendering for better performance

### Option 2: Vite + React

**Best for**: Simpler, lighter admin panel

```
Tech Stack:
- Vite + React
- TypeScript
- Supabase JS Client
- Shadcn/ui
- Same libraries as Option 1
- Deploy to Vercel/Netlify
```

**Pros**:

- Lighter, faster build
- Simpler than Next.js
- Still very capable

---

## Project Structure

```
palace-drum-clinic-admin/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx      # Dashboard layout with nav
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── notifications/
│   │   │   │   ├── page.tsx    # List scheduled notifications
│   │   │   │   ├── new/        # Create notification
│   │   │   │   └── [id]/       # View/edit notification
│   │   │   ├── content/
│   │   │   │   ├── videos/
│   │   │   │   ├── series/
│   │   │   │   └── artists/
│   │   │   ├── analytics/
│   │   │   │   ├── overview/
│   │   │   │   ├── users/
│   │   │   │   └── content/
│   │   │   ├── users/
│   │   │   └── bookings/
│   │   └── api/                # API routes (if needed)
│   ├── components/
│   │   ├── ui/                 # Shadcn components
│   │   ├── notifications/
│   │   ├── content/
│   │   └── analytics/
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client
│   │   └── utils.ts
│   ├── services/               # Share with mobile!
│   │   ├── scheduledNotificationService.ts
│   │   ├── videoService.ts
│   │   └── analyticsService.ts
│   └── types/                  # Share with mobile!
│       └── notification.ts
├── public/
├── prisma/                     # Share schema with mobile
│   └── schema.prisma
├── .env.local
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## Setup Steps

### 1. Create New Next.js Project

```bash
# In your coding/projects directory (NOT inside mobile repo)
npx create-next-app@latest palace-drum-clinic-admin

# Options:
# ✓ TypeScript: Yes
# ✓ ESLint: Yes
# ✓ Tailwind CSS: Yes
# ✓ src/ directory: Yes
# ✓ App Router: Yes
# ✓ Customize default import alias: No

cd palace-drum-clinic-admin
```

### 2. Install Dependencies

```bash
# Core dependencies
yarn add @supabase/supabase-js zod

# UI Components (choose one)
yarn add @radix-ui/react-* # For Shadcn/ui
# OR
yarn add @mui/material @emotion/react @emotion/styled

# Data tables
yarn add @tanstack/react-table

# Forms
yarn add react-hook-form @hookform/resolvers

# Charts
yarn add recharts

# Date handling
yarn add date-fns

# File upload (for video content)
yarn add react-dropzone

# Dev dependencies
yarn add -D @types/node
```

### 3. Initialize Shadcn/ui (Recommended)

```bash
npx shadcn-ui@latest init

# Then add components as needed:
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add form
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add select
```

### 4. Setup Environment Variables

Create `.env.local`:

```env
# Supabase (same as mobile app!)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional: Service role key for admin operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Setup Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For server-side admin operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### 6. Share Code Between Mobile & Admin

Create a shared package or use git submodules:

**Option A: Monorepo (Recommended)**

```bash
# Restructure as monorepo
mkdir palace-drum-clinic
cd palace-drum-clinic

# Move existing projects
mv ../palace-drum-clinic-mobile packages/mobile
mv ../palace-drum-clinic-admin packages/admin

# Create shared package
mkdir -p packages/shared/src/{types,services,utils}

# Root package.json
{
  "name": "palace-drum-clinic",
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}

# Use yarn workspaces
yarn install
```

**Option B: Copy Shared Files**

- Copy `/src/types/notification.ts` to admin
- Copy `/src/services/scheduledNotificationService.ts` to admin
- Keep them in sync manually (not ideal)

**Option C: NPM Package**

- Publish shared types/services as private npm package
- Import in both projects

---

## Admin Authentication & Authorization

### 1. Create Admin Role in Supabase

Run this SQL in Supabase:

```sql
-- Add admin role to AppUser table
ALTER TABLE "AppUser"
ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'user'
CHECK (role IN ('user', 'admin', 'super_admin'));

-- Create admin_users view for easy checking
CREATE OR REPLACE VIEW admin_users AS
SELECT id, "authUserID", "firstName", "lastName", role
FROM "AppUser"
WHERE role IN ('admin', 'super_admin');

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "AppUser"
    WHERE "authUserID" = user_id::text
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
```

### 2. Update RLS Policies

Update the scheduled_notifications RLS policy:

```sql
-- Update policy in the migration file
DROP POLICY IF EXISTS "Admins can do anything with scheduled notifications"
ON public.scheduled_notifications;

CREATE POLICY "Admins can do anything with scheduled notifications"
  ON public.scheduled_notifications
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));
```

### 3. Implement Admin Auth in Dashboard

Create `src/middleware.ts`:

```typescript
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Not logged in -> redirect to login
  if (!session && !req.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Check if user is admin
  if (session) {
    const { data: user } = await supabase
      .from("AppUser")
      .select("role")
      .eq("authUserID", session.user.id)
      .single();

    if (!user || !["admin", "super_admin"].includes(user.role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!login|unauthorized|_next/static|_next/image|favicon.ico).*)"],
};
```

---

## Key Features to Build

### 1. Notification Scheduler (Priority 1)

- ✅ Calendar view of scheduled notifications
- ✅ Create/edit/delete scheduled notifications
- ✅ Target audience selection (all users, segments)
- ✅ Preview notification before sending
- ✅ Analytics: delivery rate, open rate
- ✅ Duplicate/template system for recurring notifications

### 2. Video Content Management (Priority 1)

- 📤 Video upload with progress
- ✏️ Edit video metadata (title, description, tags)
- 🗂️ Organize into series
- 📄 PDF attachment upload
- 🖼️ Thumbnail management
- 👁️ Show/hide videos
- 🔄 Reorder videos in series

### 3. Analytics Dashboard (Priority 2)

- 📊 User growth charts
- 📹 Video view statistics
- ⏱️ Average watch time
- 🔥 Streak data
- 🎯 Goal completion rates
- 📱 Notification performance
- 📅 Booking statistics

### 4. User Management (Priority 2)

- 👥 User list with search/filter
- 👤 View user profile details
- 📈 User progress tracking
- 🔕 Manage notification preferences
- 🚫 Ban/suspend users (if needed)

### 5. Drum Zone Management (Priority 3)

- 📅 Booking calendar view
- ⚙️ Manage drum zone sites
- 📊 Booking analytics

---

## Video Upload Strategy

For video uploads, you have options:

### Option 1: Direct Upload to Supabase Storage

```typescript
// Good for small-medium files
const { data, error } = await supabase.storage
  .from("videos")
  .upload(`uploads/${file.name}`, file, {
    cacheControl: "3600",
    upsert: false,
  });
```

### Option 2: Cloudinary/Mux (Recommended for video)

```typescript
// Better for video processing, thumbnails, streaming
// Cloudinary: https://cloudinary.com
// Mux: https://mux.com

// Upload to Cloudinary, store URL in Supabase DB
```

### Option 3: AWS S3 + CloudFront

```typescript
// Most flexible, best performance
// Pre-signed URLs for secure uploads
```

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Environment Variables on Vercel

Add all env vars from `.env.local` to Vercel dashboard

---

## Security Checklist

- ✅ Admin role checking middleware
- ✅ RLS policies on all tables
- ✅ Service role key only on server-side
- ✅ Rate limiting on API routes
- ✅ Input validation with Zod
- ✅ CORS configuration
- ✅ Secure file upload validation
- ✅ Audit logs for admin actions

---

## Quick Start Template

I can generate a full starter template for you. Would you like me to:

1. **Create a complete Next.js admin starter** in a new directory?
2. **Setup the monorepo structure** with shared packages?
3. **Just provide the notification scheduler UI** as a standalone web app?

Let me know and I'll set it up! 🚀

---

## Next Steps

1. ✅ Run the scheduled_notifications migration in Supabase
2. ✅ Deploy the send-scheduled-notifications Edge Function
3. ✅ Setup pg_cron job (or use Vercel Cron)
4. ✅ Create the admin dashboard project
5. ✅ Build notification scheduler UI
6. ✅ Add video upload functionality
7. ✅ Build analytics dashboard

---

## Cost Estimate

- **Vercel**: Free tier for hobby, $20/mo for Pro
- **Supabase**: Already using (no additional cost)
- **Cloudinary**: Free tier: 25GB storage, 25GB bandwidth
- **Domain**: ~$12/year for admin.palacedrumclinic.com

**Total**: ~$0-20/month depending on usage
