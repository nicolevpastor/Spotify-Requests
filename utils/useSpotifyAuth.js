import getEnv from "./env";
import { Platform } from "react-native";
import { useState, useEffect } from "react";
import {
  ResponseType,
  useAuthRequest,
  makeRedirectUri,
} from "expo-auth-session";
import {
  getMyTopTracks,
  getAlbumTracks,
  exchangeCodeForToken,
} from "./apiOptions";

import * as WebBrowser from "expo-web-browser";

const {
  USE_CACHE,
  REDIRECT_URI,
  SCOPES,
  CLIENT_ID,
  ALBUM_ID,
  SPOTIFY_API: { DISCOVERY },
} = getEnv();

// needed so that the browswer closes the modal after auth token
WebBrowser.maybeCompleteAuthSession();

const formatter = (data) =>
  data.map((val) => {
    const artists = val.artists?.map((artist) => ({ name: artist.name }));
    return {
      songTitle: val.name,
      songArtists: artists,
      albumName: val.album?.name,
      imageUrl: val.album?.images[0]?.url ?? undefined,
      duration: val.duration_ms,
      externalUrl: val.external_urls?.spotify ?? undefined,
      previewUrl: val.preview_url ?? undefined,
    };
  });

const useSpotifyAuth = (ALBUM_ONLY = false) => {
  const [token, setToken] = useState("");
  const [tracks, setTracks] = useState([]);
  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Code,
      clientId: CLIENT_ID,
      scopes: SCOPES,
      usePKCE: true,
      redirectUri:
        Platform.OS !== "web"
          ? REDIRECT_URI
          : makeRedirectUri({
              // scheme: null, // optional for web, mobile default: 'exp'
              preferLocalhost: true,
              isTripleSlashed: true,
              // useProxy: true, // not needed afaict, default: false
            }),
    },
    DISCOVERY
  );

  useEffect(() => {
    // console.log("response changed:", response);

    if (response?.type === "success") {
      // const { access_token } = response.params;
      // setToken(access_token);
      const code = response.params.code;

      exchangeCodeForToken(code, REDIRECT_URI, CLIENT_ID, request.codeVerifier)
        .then((tokenResponse) => {
          setToken(tokenResponse.access_token);
          // Optionally store refresh_token for token refresh flow
        })
        .catch((error) => {
          // handle error
        });
    }
    if (Platform.OS === "web" && location.hash)
      setToken(location.hash.split("=")[1]);
  }, [response]);

  useEffect(() => {
    // console.log("token changed: -", token, "- USE_CACHE", USE_CACHE);

    const fetchTracks = async () => {
      let res;
      switch (ALBUM_ONLY) {
        case true:
          res = await getAlbumTracks(ALBUM_ID, token);
          break;
        default:
          res = await getMyTopTracks(token);
          break;
      }
      setTracks(formatter(res));
    };

    if (token || USE_CACHE) {
      // Authenticated, make API request
      fetchTracks();
    }
  }, [token]);

  const setLoggedIn = () => {
    promptAsync(
      Platform.OS === "web"
        ? { windowName: "_self" }
        : /* this is for forcing the popup to be created within the same window so needs same context */
          {}
    );
  };
  return { token: token ?? undefined, tracks, getSpotifyAuth: setLoggedIn };
};

export default useSpotifyAuth;
