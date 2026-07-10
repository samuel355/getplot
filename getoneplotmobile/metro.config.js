const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// react-native-maps is native-only (Fabric codegen components aren't web-compatible).
// The app never renders maps on web, but `web.output: "server"` (needed for the
// app/api/*+api.ts routes) makes EAS eagerly bundle the whole app for the "web"
// platform too, which would otherwise crash trying to resolve it.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName === "react-native-maps") {
    return { type: "empty" };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
