# Event Registration Logic Skill

This skill provides the logic and state transition rules for managing athlete registrations in the ZonaCrono platform.

## Overview

The registration system supports two distinct workflows:
1. **Immediate**: Registration and payment reporting in a single step.
2. **Deferred**: Registration first, payment reporting later via a unique URL.

## Usage

Use this skill when:
- Implementing the registration form components.
- Designing the athlete status/unique URL page.
- Configuring email notification triggers.
- Setting up manager alerts (Telegram).
- Refactoring the dashboard "Pendientes" and "Reportados" tabs.

## Core States

- `PENDING`: Waiting for payment (only Flow 2).
- `REPORTED`: Payment submitted, waiting for manager review.
- `APPROVED`: Registration complete, dorsal number assigned.
- `REJECTED`: Issues with payment or data.

## Implementation Details

Refer to [SKILL.md](./SKILL.md) for the detailed step-by-step logic for each flow.
