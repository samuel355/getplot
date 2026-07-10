const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// @supabase/supabase-js's ESM build (dist/index.mjs, resolved via the "module"/"exports"
// fields) contains `import(/* webpackIgnore */ ... OTEL_PKG)` for optional OpenTelemetry
// tracing — a fully dynamic import() expression that Hermes/Metro's parser can't handle
// ("Invalid expression encountered"), breaking the release archive build. The CJS build
// (dist/index.cjs) does the same thing with a plain `require(s)` call instead, which is
// ordinary JS with no special syntax. Force resolution to the CJS entry point.
const SUPABASE_JS_CJS = path.resolve(
  __dirname,
  "node_modules/@supabase/supabase-js/dist/index.cjs",
);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "@supabase/supabase-js") {
    return { type: "sourceFile", filePath: SUPABASE_JS_CJS };
  }

  // react-native-maps is native-only (Fabric codegen components aren't web-compatible).
  // The app never renders maps on web, but `web.output: "server"` (needed for the
  // app/api/*+api.ts routes) makes EAS eagerly bundle the whole app for the "web"
  // platform too, which would otherwise crash trying to resolve it.
  if (platform === "web" && moduleName === "react-native-maps") {
    return { type: "empty" };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
