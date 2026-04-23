// Dynamic Expo config — extends app.json with values derived from env vars.
// Used instead of editing app.json directly for anything environment-specific.
//
// Google OAuth iOS URL scheme:
//   The iOS URL scheme must match the reversed client ID so OAuth redirects
//   land back in the app after the browser flow.
//   Format: com.googleusercontent.apps.<everything-before-.apps.googleusercontent.com>
//   Example: "123456789-abc.apps.googleusercontent.com" → "com.googleusercontent.apps.123456789-abc"

import type { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";

  // Derive the URL scheme from the client ID.
  // Client ID format:  <prefix>.apps.googleusercontent.com
  // URL scheme format: com.googleusercontent.apps.<prefix>
  const googleUrlScheme = googleIosClientId
    ? `com.googleusercontent.apps.${googleIosClientId.replace(".apps.googleusercontent.com", "")}`
    : null;

  return {
    ...config,
    name: config.name ?? "BhashaLoop",
    slug: config.slug ?? "bhashaloop",
    ios: {
      ...config.ios,
      infoPlist: {
        ...(config.ios?.infoPlist ?? {}),
        ...(googleUrlScheme
          ? {
              CFBundleURLTypes: [
                {
                  CFBundleURLSchemes: [googleUrlScheme],
                },
              ],
            }
          : {}),
      },
    },
  };
};
