# Building Aurelle with EAS Build

Use **EAS Build** to create installable apps: **Android APK** or **iOS .ipa**.

---

## 1. Install EAS CLI

```bash
npm install -g eas-cli
```

Or with bun:

```bash
bun add -g eas-cli
```

---

## 2. Log in to Expo

Create a free Expo account at [expo.dev](https://expo.dev) if you don’t have one, then log in:

```bash
eas login
```

---

## 3. Configure the project (first time only)

From your project root (where `package.json` and `eas.json` are):

```bash
eas build:configure
```

If it asks to create `eas.json`, you can skip—this project already has an `eas.json` that is set up to produce **APK** (not AAB).

---

## 4. Build the Android APK

**Option A – Preview APK (recommended for testing / sharing)**

```bash
eas build --platform android --profile preview
```

**Option B – Production APK (release-style build, still outputs APK)**

```bash
eas build --platform android --profile production
```

The build runs in the cloud. When it finishes, you’ll get a link to download the **.apk** file.

---

## 5. Install the APK

- Download the APK from the link EAS gives you.
- Copy it to your Android device (or open the link on the device).
- Open the APK file and allow “Install from unknown sources” if asked.
- Install and open Aurelle.

---

## Free tier notes

- **EAS Build** has a **free tier** with a limited number of builds per month (see [expo.dev/pricing](https://expo.dev/pricing)).
- Building an **APK** (preview or production with `buildType: "apk"`) does **not** require a Google Play Developer account or AAB.
- If you later want to publish on the Play Store, you’d switch to an AAB build and use a Play Developer account.

---

## Local build (no cloud, no EAS quota)

If you have **Android Studio** installed and want to build on your machine without using EAS cloud:

```bash
npx eas build --platform android --profile preview --local
```

This produces an APK locally and does not use your EAS build quota.

---

## Troubleshooting

- **“Not logged in”** → Run `eas login` and try again.
- **Build fails on “notification” or missing files** → The app is already configured to use default notification icon/sound. If you added custom paths back, ensure those files exist.
- **Want a different app version** → Update `version` in `app.json` and/or `versionCode` in the Android section before building.

---

# Building iOS .ipa with EAS Build

You can build an **iOS .ipa** for testing (ad-hoc) or for App Store submission.

---

## Requirements for .ipa

- **Apple Developer account** ($99/year) — required for installing on real devices (ad-hoc or App Store).  
- **macOS is not required** — EAS Build runs in the cloud.

---

## Build the iOS .ipa

**1. Install EAS CLI and log in** (if you haven’t):

```bash
npm install -g eas-cli
eas login
```

**2. Configure the project** (first time only):

```bash
eas build:configure
```

**3. Start an iOS build**

**Preview .ipa (ad-hoc, for testers):**

```bash
eas build --platform ios --profile preview
```

**Production .ipa (for App Store):**

```bash
eas build --platform ios --profile production
```

The build runs in the cloud. When it finishes, you get a link to download the **.ipa** file.

---

## Install the .ipa

**Ad-hoc (preview profile)**  
- Download the .ipa from the EAS build page.  
- Install via **Apple Configurator**, **TestFlight** (if you uploaded the build), or **Xcode** (Window → Devices and Simulators → drag .ipa to the device).  
- Devices must be registered in your Apple Developer account (UDIDs) for ad-hoc installs.

**App Store**  
- Use **EAS Submit** or upload the .ipa in App Store Connect, then distribute via TestFlight or public release.

---

## iOS build notes

- First iOS build may prompt you to set up **credentials** (signing certificate, provisioning profile). EAS can create and manage them for you.  
- **bundleIdentifier** is set in `app.config.js` / `app.json` under `ios.bundleIdentifier` (this project uses `app.rork.floaura`).  
- To build for **iOS Simulator** only (no Apple Developer account needed, but not installable on a real device): add a profile in `eas.json` with `"ios": { "simulator": true }` and run with that profile.
