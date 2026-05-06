# Component Spec: AdminDashboard

## Purpose
Institutional queue for managing scholarship applications and monitoring AI performance.

## Routes
- `/admin`

## Behavior
- Fetches real-time queue from `GET /api/admin/queue`.
- Displays status distribution chart using Recharts.
- Shows AI performance metrics (accuracy, latency, auto-approval).
- Table with sortable/filterable views and links to Trace and Details.

## Design Tokens
- Colors: Alabaster surface (#FAFAF9), Navy headers.
- Components: Recharts PieChart, Lucide icons.
