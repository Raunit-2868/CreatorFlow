# CreatorFlow — Stitch Design Reference

> **Source of Truth**: Stitch Project `6643745649452062252` — "CreatorFlow UI Foundation"
> **Design System**: "Editorial Authority" (Unified Light Design System — V4 Final)
> **Core Principle**: ONE CREATORFLOW, ONE LIGHT DESIGN SYSTEM, CONSISTENCY > NOVELTY
> **Device Target**: Desktop-first (1280px), responsive down to mobile

---

## 1. Global Unified Design System

CreatorFlow uses **ONE UNIFIED LIGHT THEME** across the entire application:
- Public Landing Page
- Sign In & Registration
- Influencer Experience
- Brand Experience
- Admin Experience
- Collaboration & Messaging
- Settings & Analytics

There are **NO dark backgrounds**, **NO Midnight Navy**, **NO glowing effects**, **NO glassmorphism**, and **NO role-specific color themes**.

---

### 1.1 Color Palette

| Token | Hex Value | Semantic Usage |
|---|---|---|
| **Background / Canvas** | `#F5F2EB` | Main application background, warm ivory canvas |
| **Cards / Surfaces** | `#FAF9F6` | Card backgrounds, elevated surfaces, sidebar, navbar, panels |
| **Primary** | `#2B2B2B` | Soft Charcoal — headings, primary button backgrounds, high-contrast text |
| **Primary Hover** | `#3D3D3D` | Hover state for primary buttons and interactive elements |
| **Premium Accent** | `#B8955A` | Champagne Gold — primary accent, key CTAs, highlights, active indicators |
| **Accent Light** | `#F0E7D5` | Light champagne tint — badge backgrounds, active pill highlights, subtle fills |
| **Main Text** | `#222222` | Deep charcoal — primary body text, title copy, high legibility |
| **Secondary Text** | `#6B6B6B` | Medium grey — subtitles, captions, timestamps, secondary labels |
| **Border / Divider** | `#DDD8CE` | Card borders, input outlines, table dividers, panel borders |
| **Success** | `#4F765E` | Muted forest sage — approved status, positive deltas, active milestones |
| **Warning** | `#A4773A` | Warm ochre amber — pending reviews, draft states, moderation warnings |
| **Error** | `#A95C5C` | Muted terracotta red — rejected status, form errors, overdue alerts |

#### Strict Visual Constraints:
- ❌ **Forbidden**: Midnight Navy (`#0B1220`), pure black backgrounds (`#000000`), purple, violet, lavender, bright blue, cyan, neon, pink.
- ❌ **Forbidden**: Blue-purple gradients, rainbow gradients, glowing effects, neon borders, blur glassmorphism.
- ❌ **Forbidden**: Role-specific themes (Brand, Influencer, and Admin all share identical palette tokens).
- ✅ **Required**: Warm Ivory (`#F5F2EB`) base, Soft Cream (`#FAF9F6`) cards, Soft Charcoal (`#2B2B2B`) primary text and buttons, Champagne Gold (`#B8955A`) accents, Warm borders (`#DDD8CE`).

---

### 1.2 Typography

Two Google Font families are used uniformly:
- **Manrope**: Major headings, page titles, hero headers, modal titles, stat metric numbers (`font-headline`, weights: 600, 700, 800).
- **Inter**: Body text, navigation links, button labels, table cells, form inputs, metadata chips (`font-body`, weights: 400, 500, 600).

#### Type Scale

| Token | Size | Line Height | Letter Spacing | Weight | Font | Usage |
|---|---|---|---|---|---|---|
| `display-xl` | 48px | 56px | -0.02em | 700 / 800 | Manrope | Marketing hero heading |
| `display-lg` | 36px | 44px | -0.015em | 700 | Manrope | Section headings, dashboard welcome |
| `headline-lg` | 28px | 36px | -0.01em | 600 | Manrope | Page titles, key modal titles |
| `headline-md` | 22px | 30px | -0.005em | 600 | Manrope | Section headers, card group titles |
| `headline-sm` | 18px | 26px | — | 600 | Manrope | Card titles, subsection headers |
| `body-lg` | 16px | 26px | — | 400 / 500 | Inter | Lead paragraphs, emphasis text |
| `body-md` | 14px | 22px | — | 400 | Inter | Standard body copy, table cells |
| `body-sm` | 13px | 20px | — | 400 | Inter | Helper text, secondary descriptions |
| `label-lg` | 14px | 20px | — | 500 / 600 | Inter | Buttons, navigation links |
| `label-md` | 12px | 16px | 0.01em | 500 | Inter | Badges, tags, form field labels |
| `label-caps` | 11px | 14px | 0.05em | 600 | Inter | Uppercase table headers, section eyebrows |

---

### 1.3 Spacing System

Systematic 4px-based spacing scale:
- `space-3xs`: 4px (0.25rem)
- `space-2xs`: 8px (0.5rem)
- `space-xs`: 12px (0.75rem)
- `space-sm`: 16px (1rem)
- `space-md`: 24px (1.5rem)
- `space-lg`: 32px (2rem)
- `space-xl`: 40px (2.5rem)
- `space-2xl`: 48px (3rem)
- `space-3xl`: 64px (4rem)

---

### 1.4 Border Radii

- `rounded-sm`: 4px — Small tags, indicator bars
- `rounded-md`: 8px (`rounded-[8px]`) — Form inputs, buttons, filter dropdowns
- `rounded-xl`: 12px (`rounded-[12px]`) — Content cards, modals, table containers, sidebar nav items
- `rounded-full`: 9999px — Avatars, status pills, notification badges

---

### 1.5 Elevation & Shadows

Soft, warm, subtle shadows without heavy contrast:
- `shadow-sm`: `0 1px 2px 0 rgba(43, 43, 43, 0.04), 0 1px 3px 0 rgba(43, 43, 43, 0.02)` — Default cards, inputs
- `shadow-md`: `0 4px 12px -2px rgba(43, 43, 43, 0.06), 0 2px 6px -1px rgba(43, 43, 43, 0.04)` — Card hover, dropdowns
- `shadow-lg`: `0 12px 28px -4px rgba(43, 43, 43, 0.08), 0 4px 12px -2px rgba(43, 43, 43, 0.04)` — Modals, popovers

---

### 1.6 Component Design Tokens & Patterns

#### Buttons
- **Primary Action (Charcoal)**:
  ```css
  bg-[#2B2B2B] text-white hover:bg-[#3D3D3D] rounded-[8px] h-10 px-4
  font-medium text-sm transition-colors shadow-sm
  ```
- **Accent Action (Champagne Gold)**:
  ```css
  bg-[#B8955A] text-white hover:bg-[#A4773A] rounded-[8px] h-10 px-5
  font-medium text-sm transition-colors shadow-sm
  ```
- **Secondary (Outline / Light Surface)**:
  ```css
  bg-[#FAF9F6] text-[#222222] border border-[#DDD8CE] hover:bg-[#F5F2EB]
  rounded-[8px] h-10 px-4 font-medium text-sm transition-colors
  ```
- **Ghost / Subtle**:
  ```css
  bg-transparent text-[#6B6B6B] hover:text-[#222222] hover:bg-[#F5F2EB]
  rounded-[8px] h-10 px-3 font-medium text-sm transition-colors
  ```

#### Inputs & Form Controls
```css
bg-[#FAF9F6] border border-[#DDD8CE] text-[#222222] placeholder:text-[#6B6B6B]
rounded-[8px] h-10 px-3.5 text-sm font-normal
focus:outline-none focus:border-[#B8955A] focus:ring-1 focus:ring-[#B8955A]
transition-all
```
- **Labels**: `font-medium text-xs uppercase tracking-wider text-[#6B6B6B] mb-1.5 block`
- **Error State**: `border-[#A95C5C] focus:border-[#A95C5C] focus:ring-[#A95C5C]`

#### Cards
```css
bg-[#FAF9F6] border border-[#DDD8CE] rounded-[12px] p-6 shadow-sm
hover:border-[#B8955A]/50 transition-colors
```

#### Tables
- **Table Container**: `bg-[#FAF9F6] border border-[#DDD8CE] rounded-[12px] overflow-hidden`
- **Header Row**: `bg-[#F5F2EB] border-b border-[#DDD8CE] text-[#6B6B6B] text-[11px] font-semibold uppercase tracking-wider`
- **Body Row**: `border-b border-[#DDD8CE]/60 text-[#222222] text-sm hover:bg-[#F5F2EB]/50 transition-colors`

#### Badges & Status Chips
| Status | Badge Classes |
|---|---|
| **Active / Approved / Completed** | `bg-[#4F765E]/15 text-[#4F765E] border border-[#4F765E]/20` |
| **Pending / Under Review** | `bg-[#A4773A]/15 text-[#A4773A] border border-[#A4773A]/20` |
| **Rejected / Inactive / Error** | `bg-[#A95C5C]/15 text-[#A95C5C] border border-[#A95C5C]/20` |
| **Highlight / AI Match** | `bg-[#F0E7D5] text-[#B8955A] border border-[#B8955A]/30` |
| **Neutral / Tag** | `bg-[#F5F2EB] text-[#6B6B6B] border border-[#DDD8CE]` |

---

## 2. Application Shell Architecture

### 2.1 Sidebar (All Dashboards: Influencer, Brand, Admin)
- **Container**: `fixed left-0 top-0 h-screen w-64 bg-[#FAF9F6] border-r border-[#DDD8CE] flex flex-col justify-between z-40`
- **Logo Area**: `h-16 flex items-center px-6 border-b border-[#DDD8CE]`
- **Nav Links (Default)**: `flex items-center gap-3 px-3.5 py-2.5 rounded-[8px] text-sm font-medium text-[#6B6B6B] hover:text-[#222222] hover:bg-[#F5F2EB] transition-colors`
- **Nav Links (Active)**: `bg-[#F0E7D5] text-[#222222] font-semibold border-l-2 border-[#B8955A]`
- **User Footer**: Profile avatar, user name, role badge, sign-out button.

### 2.2 Top Navbar
- **Container**: `fixed top-0 left-64 right-0 h-16 bg-[#FAF9F6] border-b border-[#DDD8CE] px-6 flex items-center justify-between z-30`
- **Search Bar**: Quick search with shortcut pill (`⌘K`), `bg-[#F5F2EB] border border-[#DDD8CE] rounded-[8px] h-9 px-3 text-sm`
- **Actions Area**: Notification bell icon with unread badge, messages button, user dropdown menu.

### 2.3 Main Content Canvas
- **Wrapper**: `ml-64 pt-16 min-h-screen bg-[#F5F2EB] p-8`
- **Max Width Container**: `max-w-7xl mx-auto space-y-6`

---

## 3. Screen Inventory & Stitch Project Mapping

| Area | Screen Name | Stitch Screen ID | Unified Light Layout |
|---|---|---|---|
| **Public** | Landing Page | `9c268ffb22e140f0b111d700e5820f45` | Warm Ivory bg `#F5F2EB`, Soft Cream cards `#FAF9F6`, Charcoal text `#222222`, Champagne CTAs |
| **Public** | Sign In | `8d9a8fafaa5f44958d97fdf37c47952a` | Centered Soft Cream card `#FAF9F6`, Charcoal primary button, clean Warm Ivory canvas |
| **Public** | Registration / Role Select | `d64461ae0ba94a8fa39ccd47acf64ac2` | Dual role cards (Influencer / Brand) on Warm Ivory `#F5F2EB` |
| **Public** | Influencer Onboarding | `7279807592a84eb198b0edd34b05d9cc` | Multi-step form card, progress indicator in Champagne Gold |
| **Public** | Brand Onboarding | `3da9ac5552654be18c914fd857f7814a` | Company details form, category tags |
| **Influencer** | Dashboard | `a75295012d9a46cebbb09a4005aabf56` | 4 metric cards, Recommended Campaigns, Recent Applications table |
| **Influencer** | Campaign Discovery | `f397a827d56a4906a9ef8b1511e0cd97` | Filter drawer/bar, campaign cards with AI Match score badge |
| **Influencer** | Campaign Details | `b2606a6158eb4543970faa2017ae1959` | Brief, deliverables checklist, budget, requirements, Apply CTA |
| **Influencer** | Applications | `d16f3fbd27f741f8b66ec326aecbb0f0` | Status tabs (All, Pending, Accepted, Rejected), applications table |
| **Influencer** | Profile / Media Kit | `787d688b14014f60a7d75c2f8f5ee5eb` | Bio, social handles, audience demographics, portfolio gallery |
| **Influencer** | Collaborations | `28b1619056e8436d90a171a47cb3e85b` | Active contracts, deliverables submission, approval milestones |
| **Brand** | Dashboard | `c39e70c199ba41519d29abfdec597557` | Active campaigns, total budget spent, active creators, KPIs |
| **Brand** | Discover Creators | `632324f6db214617beed6eb3384d3ea4` | Creator cards with match score, filters by niche/platform/followers |
| **Brand** | Create Campaign | `680dd2d9c7d94dea9741a11c2bd289b8` | Step wizard: basics, deliverables, timeline, budget, target audience |
| **Brand** | Campaign Management | `8ddd4d56eded424f89b785ec99c97012` | Campaigns table with status filters (Draft, Active, Completed) |
| **Brand** | Application Management | `8bd0f414f1ac47a1af9140436d9865ca` | Applicant review, shortlisting, offer dispatch |
| **Brand** | Collaborations & Review | `c2184bbc854c4496a33b73ceb54e09fa` | Deliverable review, feedback notes, milestone approval |
| **Brand** | Analytics & Reporting | `e721dec8312546c099540d2f4c0b9edc` | Reach, engagement rate, ROI tracking charts |
| **Admin** | Dashboard | `9e3d8f10949344bcbd5379d3e6d01982` | Platform health, total users, GMV, moderation queue |
| **Admin** | Users Management | `ab2cf9afc0b24cb3ac1bff4658ffc5b5` | User table with role filters, ban/verify actions |
| **Admin** | Campaign Oversight | `f9138c7eda4b424cb7807ee4b7b35fc3` | Platform-wide campaign moderation |
| **Shared** | Messages | `5184d71e6ec241d7a605825bc5fe832b` | Split-pane chat, thread history, file attachment, real-time typing |
| **Shared** | Notifications | `4c080f025536463e92d603cb09e4234c` | Real-time alerts, mark all as read, filter by type |
| **Shared** | Settings | `8679dfa75b3847feba453ced06e9f1c9` | Profile settings, notification preferences, security, payouts |

---

## 4. Design Verification Checklist

Before any screen or component is finalized:
- [ ] Uses `#F5F2EB` for canvas/page background.
- [ ] Uses `#FAF9F6` for cards, panels, sidebar, and navbar surfaces.
- [ ] Text uses `#222222` for high priority and `#6B6B6B` for secondary/meta.
- [ ] Borders use `#DDD8CE` (no dark borders).
- [ ] Buttons use `#2B2B2B` (primary) or `#B8955A` (accent).
- [ ] No dark mode, midnight navy, neon colors, glassmorphism, or glowing shadows.
- [ ] Fonts are Manrope (headlines) and Inter (body/UI).
