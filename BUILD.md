# Building FloAura APK with EAS Build

You can build an **Android APK** (installable file) for free using **EAS Build**. No need for AAB or a paid Google Play account—the APK can be installed directly on devices (sideloading, sharing, or other stores).

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
- Install and open FloAura.

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
