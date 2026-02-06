import { Platform } from "react-native";
import Constants from "expo-constants";

const {
  spotifyClientId: CLIENT_ID,
  redirectUri: REDIRECT_URI,
  auddToken: AUDD_API_TOKEN,
  albumId: ALBUM_ID,
} =
  Constants.expoConfig?.extra ??
  Constants.manifest?.extra ??
  {};

const redirectUri = (uri) => {
  if (!uri) {
    const err = new Error(
      "No redirect URI provided.\nPlease provide a redirect URI in your .env file."
    );
    console.error(err);
    alert(err);
  }
  return Platform.OS === "web" ? "http://localhost:19006/" : uri;
};

const ENV = {
  USE_CACHE: false,
  CLIENT_ID,
  SCOPES: [
    "user-read-currently-playing",
    "user-read-recently-played",
    "user-read-playback-state",
    "user-top-read",
    "user-modify-playback-state",
    "streaming",
    "user-read-email",
    "user-read-private",
  ],
  REDIRECT_URI: redirectUri(REDIRECT_URI),
  ALBUM_ID,
  AUDD_API_TOKEN,
  SPOTIFY_API: {
    DISCOVERY: {
      authorizationEndpoint: "https://accounts.spotify.com/authorize",
      tokenEndpoint: "https://accounts.spotify.com/api/token",
    },
    SHORT_TERM_API:
      "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=30",
    LONG_TERM_API:
      "https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=30",
    ALBUM_TRACK_API_GETTER: (albumId) =>
      `https://api.spotify.com/v1/albums/${albumId}/tracks`,
  },
};

const getEnv = () => ENV;
export default getEnv;