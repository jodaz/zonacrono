---
name: event-registration-logic
description: Guides the implementation of dual-path athlete registration and payment reporting flows with automated notifications.
---

# Event Registration Logic & Email Notifications

This skill manages the two primary registration and payment reporting flows for athletes in the ZonaCrono platform, with a primary focus on automated email communication via **Resend**.

## 1. Flow 1: Immediate Registration and Report (Ideal Path)

**Trigger**: Athlete fills data, transfers payment, and uploads the receipt in the same form.

### 👤 Athlete Perspective
- **UI Interaction**: After submission, redirect to a **Unique URL**.
- **Status Display**: Immediately shows **"En Revisión"** (In Review).
- **Email Notification**: Sent from **notificaciones@zonacrono.com**.
  - **Subject**: "Registro y Comprobante Recibido - [Nombre del Evento]"
  - **Content**: Confirmation of receipt + **Unique URL Link** + Instruction to save the link to check for the Dorsal Number once approved.

### 🏢 Manager Perspective
- **Dashboard**: Entry appears directly in the **"Reportados"** tab (skipping "Pendientes").
- **Telegram Alert**: (Optional/Secondary) Immediate notification via Bot.

---

## 2. Flow 2: Registro y Reporte Diferido (Deferred Path)

**Trigger**: Athlete fills data but selects "Reportar pago más tarde" or submits without a receipt.

### Phase A: Reservation (Reserva de Cupo)
- **👤 Athlete Perspective**:
  - **UI Interaction**: Redirect to **Unique URL**.
  - **Status Display**: Shows Bank Details + **"Pago Pendiente"** status.
  - **Email Notification**: Sent from **notificaciones@zonacrono.com**.
    - **Subject**: "Reserva de Cupo: [Nombre del Evento]"
    - **Content**: **Unique URL Link** + Warning: "Tienes hasta las 11:59 PM de hoy para reportar el pago o la reserva será cancelada".
- **🏢 Manager Perspective**:
  - **Dashboard**: Entry appears in the **"Pendientes"** tab.

### Phase B: Reporting (Fase Reporte)
- **👤 Athlete Perspective**:
  - **UI Interaction**: Athlete visits the Unique URL later and uploads the receipt.
  - **Status Display**: URL updates to **"En Revisión"**.
  - **Email Notification**: Sent from **notificaciones@zonacrono.com**.
    - **Subject**: "Comprobante Recibido - [Nombre del Evento]"
    - **Content**: Short confirmation that the receipt was received and is being validated.
- **🏢 Manager Perspective**:
  - **Dashboard**: Entry moves from **"Pendientes"** to **"Reportados"**.
  - **Telegram Alert**: (Optional/Secondary) Immediate notification via Bot.

---

## 3. Implementation Details

### Infrastructure
- **Provider**: [Resend](https://resend.com)
- **Sender**: `notificaciones@zonacrono.com`
- **Domain**: `zonacrono.com` (Must be verified in Resend)
- **Templates**: Built with `@react-email/components` for a premium aesthetic.

### Unique URL Generation
- Use UUID for the athlete's private status page.
- URL Pattern: `zonacrono.com/status/[uuid]`

### Expiration Logic
- Reservations expire at **11:59 PM** of the registration day.
- This must be clearly communicated in the "Reserva" email and on the status page.

---

## 4. Best Practices
- **Persistence**: Save athlete data immediately in Flow 2A to secure the reservation.
- **Clarity**: Ensure the Unique URL is always present in emails so athletes can recover their session/status at any time.
- **Tone**: Professional, encouraging, and clear regarding deadlines.
