// Injects the Google Maps API keys from the environment so real keys never land
// in app.json — this repository is public. Put the values in frontend/.env
// (gitignored); for EAS Build, set them as EAS environment variables instead.
//
// Expo merges app.json first and hands it to this function as `config`.

const pick = (...names) => {
  for (const name of names) {
    const value = process.env[name];
    if (value && !value.startsWith('REPLACE_WITH_')) return value;
  }
  return undefined;
};

const androidMapsKey = pick(
  'GOOGLE_MAPS_ANDROID_API_KEY',
  'EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY'
);

const iosMapsKey = pick(
  'GOOGLE_MAPS_IOS_API_KEY',
  'EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY'
);

module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      ...(androidMapsKey ? { googleMaps: { apiKey: androidMapsKey } } : {}),
    },
  },
  ios: {
    ...config.ios,
    config: {
      ...config.ios?.config,
      ...(iosMapsKey ? { googleMapsApiKey: iosMapsKey } : {}),
    },
  },
});
