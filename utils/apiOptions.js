import axios from "axios";
import CachedTopTracks from "./TopTracksCache.json";
import CachedAlbumTracks from "./albumTracksCache.json";
import getEnv from "./env";

const {
  SPOTIFY_API: { SHORT_TERM_API, LONG_TERM_API, ALBUM_TRACK_API_GETTER },
} = getEnv();

const NETWORK_FAILURE = new Error(
  "Network failure.\nCheck console for more details.\nRandom cached data is returned."
);

const fetcher = async (url, token) => {
  try {
    return await axios(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const getMyTopTracks = async (token) => {
  const cache = CachedTopTracks;
  try {
    let res = await fetcher(SHORT_TERM_API, token);
    if (!res || !res.data?.items.length)
      res = await fetcher(LONG_TERM_API, token);
    if (!res || !res.data?.items.length) return cache;
    return res.data?.items;
  } catch (e) {
    console.error(e);
    alert(NETWORK_FAILURE);
    Alert.alert("Network failure", NETWORK_FAILURE.message);
    return cache;
  }
};

export const getAlbumTracks = async (albumId, token) => {
  try {
    const res = await fetcher(ALBUM_TRACK_API_GETTER(albumId), token);
    const transformedResponse = res.data?.tracks?.items?.map((item) => {
      item.album = { images: res.data?.images, name: res.data?.name };
      return item;
    });
    if (!transformedResponse) return CachedAlbumTracks;
    return transformedResponse;
  } catch (e) {
    console.error(e);
    Alert.alert("Network failure", NETWORK_FAILURE.message);
    return CachedAlbumTracks;
  }
};

export const exchangeCodeForToken = async (
  code,
  redirectUri,
  clientId,
  codeVerifier
) => {
  const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirectUri);
  params.append("client_id", clientId);
  params.append("code_verifier", codeVerifier);

  try {
    const response = await axios.post(TOKEN_ENDPOINT, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data; 
  } catch (error) {
    console.error(
      "Token exchange failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};
