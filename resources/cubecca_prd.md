# Product Requirements Document: Cubecca (MVP)

## 1. Product Vision & Objective
Cubecca is a B2B SaaS platform designed to eliminate the friction of managing online reputation. By utilizing a human-in-the-loop AI agent, it allows local business owners to maintain a high-frequency, optimized response rate on Google Business Profiles (GBP) to improve local SEO and customer satisfaction, without the manual overhead of writing responses from scratch.

## 2. Target Audience & Account Structure
*   **Primary User:** Local business owners and franchise operators.
*   **Account Model:** Single Google OAuth login supporting automated multi-location mapping.
*   **Monetization:** Flat monthly SaaS subscription featuring a 1-month free trial.

## 3. Core Workflows (The MVP Scope)
*   **Automated Review Ingestion:** Background synchronization of all incoming Google reviews (positive, neutral, and negative) across all linked locations.
*   **Universal AI Drafts:** The agent proactively generates a contextual draft response for every incoming review before the user even logs in.
*   **Human-in-the-Loop Triage:**
    *   *Approve:* One-click publishing to Google Maps via GBP API.
    *   *Refactor:* Prompt-based iteration (e.g., "Make this shorter," "Mention the weekend discount").
    *   *Reject:* Discard the AI draft for manual text entry.
*   **Event-Driven Alerts:** Automated email notifications dispatched to the owner when a new batch of reviews has been processed and drafts are awaiting approval.
*   **Weekly Insights:** An AI-generated weekly summary report highlighting operational trends (e.g., recurring praises, repeated complaints) extracted from review sentiment.

## 4. Global Settings & Context
*   **Tone Control:** Global AI persona selection (e.g., Professional, Casual, Empathetic).
*   **Business Context Injection:** A static text field where owners can input permanent business rules, manager names, or policies to ground the AI agent's responses.

## 5. Technical Stack
*   **Frontend Framework:** Next.js 16 and React 19 (App Router).
*   **UI/UX:** Aceternity UI components and Framer Motion for micro-interactions.
*   **Backend & Database:** Supabase (PostgreSQL, Auth, Edge Functions).
*   **AI Orchestration:** LangGraph for agentic workflow management.
*   **LLM Engine:** Google Gemini.
*   **External APIs:** Google Business Profile API (OAuth 2.0).

## 6. Design System & UI Specifications
*   **Aesthetic:** Utilitarian, light-mode, high-contrast, zero-gradient developer-centric minimalism.
*   **Palette:** `#FAFAFA` (App Background), `#FFFFFF` (Surface/Cards), `#E4E4E7` (Borders), `#090A0B` (Primary Text).
*   **Typography:** `Geist` or similar high-readability sans-serif.
*   **Animation:** Restrained Framer Motion spring physics (`stiffness: 260`, `damping: 20`) restricted to hover scaling (`0.98`).