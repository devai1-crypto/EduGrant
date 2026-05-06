# Component Spec: StudentPortal

## Purpose
A multi-step concierge form for scholarship applications. Captures Identity, Academic, and Financial data, plus file uploads for "The Vault".

## Routes
- `/apply`

## Behavior
- 5-step animated flow using Framer Motion.
- Validation on required fields.
- Real API integration with `POST /api/applications`.
- Redirects to `/status/:run_id` upon successful submission.

## Design Tokens
- Colors: Navy (#001F3F), Electric (#0066FF).
- Layout: Centered 3xl container, glassmorphism border.
- Animations: Slide-and-fade transitions between steps.
