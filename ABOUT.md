# About Aurelle

**Aurelle** is your personal cycle and wellness companion. The name suggests a gentle, supportive “aura” around your cycle — **Your Cycle, Your Glow**.

---

## What it is

- **App name:** Aurelle  
- **Tagline:** Your Cycle, Your Glow ✨  
- **Slug / ID:** floaura (used in URLs and bundle IDs, e.g. `app.rork.floaura`)  
- **Platform:** iOS and Android (Expo/React Native), with optional web.

Aurelle helps you **track your menstrual cycle**, **log daily symptoms and mood**, **see predictions** (next period, ovulation, fertile window), and **learn** about cycle health, vaginal health, reproductive health, and mental health — all with a focus on **privacy** and **no account required** (data stays on your device).

---

## What it does for you

### 1. **Home**
- Personalized greeting (Good morning / afternoon / evening) and your name.
- **Your Cycle** card: days until next period, next period date, estimated ovulation, and fertile window (when you’ve set cycle data).
- **Today’s wellness tip** that changes by phase (period, fertile, ovulation, or general) — e.g. hydration, sleep, cramps, mood.
- **Daily tips**: small, actionable habits (water, sleep, sunlight, movement, food) in rotating cards.

### 2. **Calendar**
- Month view with **cycle phases** (period, fertile, ovulation, safe) shown as colored indicators (e.g. droplet, heart, star, shield).
- Tap any day to **log that day**: flow (light / medium / heavy), pain (0–4), mood (happy, neutral, sad, anxious, angry), symptoms (cramps, bloating, headache, fatigue, etc.), and notes.
- **Recent logs** list: view, edit, or delete past logs.

### 3. **Insights (Health Guide)**
- **Trusted answers about your body** in four topics:
  - **Cycle Health** — periods and cycle basics  
  - **Vaginal Health** — discharge, hygiene, comfort  
  - **Reproductive Health** — fertility and pregnancy  
  - **Mental Health** — mood, anxiety, well-being  
- Article pages with clear sections, visual/color guides where relevant, and “when to see a doctor” when applicable.

### 4. **Chat (AuraBot)**
- **AuraBot** — “Your cycle companion”: an in-app AI assistant.
- Ask questions about your cycle, symptoms, or wellness; get supportive, non-medical answers.
- Disclaimer: AuraBot is not a medical professional; users are directed to consult a healthcare provider for medical advice.

### 5. **Settings**
- Edit **name** and **cycle settings** (last period start, period length, cycle length).
- **Clear chat** (reset AuraBot conversation).
- **Log out** (clears local user/cycle data so you can start fresh or “switch” user on the same device).

---

## Onboarding

- **Welcome:** Name entry and short pitch (track your cycle, private & secure).
- **Cycle setup (optional):** “Do you know your last period date?”  
  - **Yes** → Last period end date, period length, cycle length → predictions enabled.  
  - **Not sure / I’ll add later** → Skip; you can add period data later in Settings.
- **Privacy:** “Your data stays on your device. No account required.”

---

## Design and tech

- **Visual style:** Gradients (pink → purple → lavender/blue), soft cards, light backgrounds, feminine but clean.
- **Features:** Notifications (optional), typed routes, EAS Update support, optional Expo Notifications (icon, sound).
- **Data:** User, cycle data, day logs, and chat messages are stored **locally** (e.g. AsyncStorage); no server account is required to use the app.

---

## In short

**Aurelle** is a **cycle and wellness app** that gives you:

- **Cycle tracking and predictions** (next period, ovulation, fertile window)  
- **Daily logging** (flow, pain, mood, symptoms, notes) on a **calendar**  
- **Phase-aware wellness tips** and daily habit ideas  
- **Health Guide** (Insights) with articles on cycle, vaginal, reproductive, and mental health  
- **AuraBot** — an AI chat companion for cycle and wellness questions (not a substitute for medical advice)  
- **Privacy-first, no account** — data on device only  

All wrapped under the name **Aurelle** and the tagline **Your Cycle, Your Glow**.
