import "dotenv/config";

export default ({ config }) => ({
  ...config,
  extra: {
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
    redirectUri: process.env.REDIRECT_URI,
    auddToken: process.env.AUDD_API_TOKEN,
    albumId: process.env.ALBUM_ID,
  },
});
