export default ({ config }) => {
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  return {
    ...config,
    ios: {
      ...config.ios,
      config: {
        ...config.ios?.config,
        googleMapsApiKey,
      },
    },
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
    plugins: [
      ...(config.plugins || []).filter(
        (p) => !(Array.isArray(p) && p[0] === "react-native-maps"),
      ),
      [
        "expo-router",
        {
          origin: process.env.EXPO_PUBLIC_APP_URL,
        },
      ],
      "expo-secure-store",
      [
        "react-native-maps",
        {
          iosGoogleMapsApiKey: googleMapsApiKey,
          androidGoogleMapsApiKey: googleMapsApiKey,
        },
      ],
      "expo-image",
      "expo-splash-screen",
      "expo-web-browser",
    ],
  };
};
