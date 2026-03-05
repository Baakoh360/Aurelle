const base = {
  sdkVersion: "54.0.0",
  name: "FloAura",
  slug: "floaura",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "app.rork.floaura",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "app.rork.floaura",
    permissions: [
      "android.permission.RECEIVE_BOOT_COMPLETED",
      "android.permission.SCHEDULE_EXACT_ALARM",
      "android.permission.REQUEST_INSTALL_PACKAGES",
    ],
  },
  web: {
    favicon: "./assets/images/favicon.png",
  },
  experiments: {
    typedRoutes: true,
  },
};

const plugins = [
  ["expo-router", { origin: "https://rork.com/" }],
];

// Only add expo-notifications plugin when the package is installed (e.g. in project node_modules)
try {
  require.resolve("expo-notifications", { paths: [__dirname] });
  const path = require("path");
  const fs = require("fs");
  const notifIcon = fs.existsSync(path.join(__dirname, "local/assets/notification_icon.png"))
    ? "./local/assets/notification_icon.png"
    : "./assets/images/icon.png";
  const notifSound = path.join(__dirname, "local/assets/notification_sound.wav");
  const notificationConfig = {
    icon: notifIcon,
    color: "#ffffff",
    defaultChannel: "default",
    enableBackgroundRemoteNotifications: false,
  };
  if (fs.existsSync(notifSound)) {
    notificationConfig.sounds = ["./local/assets/notification_sound.wav"];
  }
  plugins.push(["expo-notifications", notificationConfig]);
} catch {
  // expo-notifications not installed or not resolvable from project; skip plugin
}

module.exports = {
  expo: {
    ...base,
    plugins,
    extra: {
      eas: {
        projectId: "93a00c20-7ebc-4857-b0fd-c64611745882",
      },
    },
  },
};
