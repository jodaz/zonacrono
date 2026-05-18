---
name: zonacrono-dev-guide
description: Master patterns for ZonaCrono: Database-driven events, root-level routing, and internal API integration.
---

# ZonaCrono Development Guide

This skill provides the core architectural patterns and development standards for the ZonaCrono project. Use this skill when adding new events, refactoring data fetching, or modifying route structures.

## 1. Database-Driven Events

ZonaCrono uses a database-driven approach for all events. All event data is stored in Supabase.

### Core Tables
- **`events`**: Main event information (name, slug, date, description, banners).
- **`categories`**: Event categories (e.g., 10K, 5K, Cyclism).
- **`registration_stages`**: Pricing stages based on dates or capacity.
- **`managers`**: Users who manage the events.

### Adding a New Event
New events are created via the Dashboard or directly in the `events` table in Supabase.
1. Define the unique `slug`.
2. Set the `event_date` and `event_time`.
3. Configure `categories` and `registration_stages` to enable registration.
4. **Duplicate Categories**: Use the bulk duplication feature in the dashboard to quickly replicate category structures across different genders.

## 2. Routing Strategy

ZonaCrono uses a root-level slug pattern for events: `zonacrono.com/[event]`.

- **Implementation**: Handled in `src/app/[event]/page.tsx`.
- **Precedence**: Static routes (like `/login`, `/dashboard`, `/api`) take precedence over dynamic routes.
- **Discovery**: The `[event]` segment is used to fetch the corresponding record from the `events` table via the internal API.

## 3. Data Fetching Patterns

We use an internal API layer to interface with the database, prioritizing Server Components and Streaming.

- **Server Components**: Fetch data directly in server components to benefit from SSR and SEO.
- **Streaming with Suspense**: Use `Suspense` boundaries for progressive loading of event data and results.
- **Internal API**: Use `/api/events` and `/api/events?slug=[slug]` for public retrieval.
- **eventService**: Use the centralized **`eventService`** from `@/features/events` for all event data fetching.
- **Supabase Client**: Use `supabase` for client-side interactions (leaves) and `supabaseAdmin` for protected server-side operations.
- **React Query Hooks**: Use custom hooks in `src/hooks/queries/` (e.g., `useRegistrations`, `useEvents`) for administrative dashboards. This ensures automatic caching, background refetching, and simplified mutation management.

## 4. Reusable Utilities

Standardized utilities for common project tasks.

- **Date Formatting**: Use **`formatDate(dateStr)`** from `@/lib` to format event dates for the UI (returns `{ day, month, year }` in Spanish).

## 5. Language & Content

**Preferred Language**: Spanish (ES).
- **Content**: All user-facing content is generated and displayed in Spanish only. Multilingual support is NOT required.
- **Codebase**: All code, comments, and internal logic must be written in English.

## 6. SEO & OpenGraph

Dynamic SEO is critical for event discovery.
- **Meta Generation**: Always use **`generateMetadata`** in `src/app/[event]/page.tsx` to fetch event details and inject meta tags dynamically.
- **OpenGraph**: Use the dynamic `opengraph-image.tsx` and **`next/image`** for optimized social previews and banners.

---

## 7. Administrative Dashboard Patterns

The dashboard is built for efficiency and high-contrast validation.

### Financial Validation (Pagos)
The financial management flow focuses on reconciling reported payments with actual bank movements.
- **`PaymentsView`**: Displays a table of registrations with their payment status. Includes a financial summary bar (Total Approved USD, Pending Count).
- **`PaymentDrawer`**: Detailed view for a single payment. Must display the uploaded receipt image (`receipt_url`) and provide one-click Approval/Rejection buttons.
- **Status Flow**: Updating a registration status to `APPROVED` or `REJECTED` automatically triggers cache invalidation for the registrations list.

### Bulk Operations
- **Bulk Creation**: The API supports bulk insertions (e.g., for categories) to reduce round-trips.
- **Validation**: Server-side validation must still enforce rules (like age-range overlaps) during bulk operations.

### Neobrutalist UI Enforcement
All dashboard components must adhere to the high-contrast neobrutalist aesthetic:
- **Shadows**: Use `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]` for cards and buttons.
- **Borders**: Heavy black borders (`border-2 border-black`).
- **Typography**: `font-black`, `uppercase`, `italic` for headers and primary actions. `font-mono` for IDs, references, and metrics.

---

## 7. Maintainability & Quality

### Standardized Barrel Exports (Mandatory)
- **Always** use `index.ts` files in every directory under `src/components/`, `src/features/`, `src/hooks/`, `src/lib/`, `src/store/`, and `src/types/`.
- **Component Sub-directories**: Components must be organized into:
  - `src/components/auth`: Authentication components.
  - `src/components/ui`: Core UI fundamentals (Button, Inputs, Animations).
  - `src/components/dashboard`: Admin/Superadmin dashboard elements.
  - `src/components/landing`: Landing page sections.
  - `src/components/events`: Event-specific components.
- Re-export all public components and logic.
- Standardize on clean imports: `import { Button } from '@/components/ui'`.

### Features Directory
- Organize logic into **`src/features/`** (e.g., `features/events`, `features/results`).
- Every feature folder must have an `index.ts` re-exporting its public API.

### Data Validation (Zod)
- **Mandatory validation**: All external data (API, forms, actions) must be validated with **Zod**.
- Use Zod schemas to ensure type safety from the API down to the UI.

---

## Example: Fetching Event with Service
```typescript
// Inside src/app/[event]/page.tsx (Server Component)
import { eventService } from '@/features/events';

const eventData = await eventService.getEventBySlug(params.event);

if (!eventData) {
  return notFound();
}
```

## Example: Displaying Formatted Date
```typescript
import { formatDate } from '@/lib';

const { day, month, year } = formatDate(event.event_date);
// Renders: 21 ABR 2026
```

## Example: Updating an Event (Server Action or API)
```typescript
const { data, error } = await supabase
  .from('events')
  .update({ name: 'Nuevo Nombre del Evento' })
  .eq('slug', 'bici-race');
```

---

## 8. Telegram Bot Integration (Secondary)

ZonaCrono uses a Telegram Bot for real-time manager alerts.
- **Library**: Use **`telegraf`**.
- **Formatting**: Always use **`MarkdownV2`** with `escapeMarkdown`.
- **Status**: Currently treated as a secondary notification channel.

## 9. Email Notifications (Primary)

ZonaCrono uses **Resend** for all critical athlete communications.

### Core Principles
- **Library**: Use **`resend`** for API interactions.
- **Sender**: All emails must be sent from **`notificaciones@zonacrono.com`**.
- **Templates**: Built with **`@react-email/components`** to maintain a premium, branded look.
- **Flows**: Email notifications are triggered by state changes in the registration process (Reservation, Payment Reported, Approval).

### Sending Emails
Emails should be sent asynchronously to avoid blocking user interaction.

```typescript
// Example: Sending a registration email
import { sendRegistrationEmail } from '@/lib/mail';

await sendRegistrationEmail({
  to: athleteEmail,
  athleteName: name,
  eventName: event.name,
  uniqueUrl: `https://zonacrono.com/status/${registrationId}`
});
```

---

## 10. Environment Configuration

ZonaCrono uses a centralized environment variable management pattern to ensure type safety and consistent defaults across the codebase.

- **Centralized Export**: All environment variables must be exported from **`src/lib/env.ts`** via a single `env` object.
- **Import Pattern**: Always import `env` from `@/lib/env` instead of using `process.env` directly.
- **Required Variables**: All variables used in the code must be defined in **`env.example`** at the project root.
- **Client Exposure**: Variables prefixed with `NEXT_PUBLIC_` are automatically exposed to the browser. Sensitive keys (like `SUPABASE_SERVICE_ROLE_KEY` or `TELEGRAM_BOT_TOKEN`) must NEVER have this prefix.

### Example: Using centralized env
```typescript
import { env } from '@/lib/env';

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const botToken = env.TELEGRAM_BOT_TOKEN;
```
