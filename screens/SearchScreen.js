import { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import axios from "axios";

import { Themes } from "../assets/Themes";
import SongList from "../components/SongList";
import getEnv from "../utils/env";

const mapSpotifyTracksToSongCards = (tracks) =>
  tracks.map((t) => ({
    songTitle: t.name,
    songArtists: (t.artists || []).map((a) => ({ name: a.name })),
    albumName: t.album?.name,
    imageUrl: t.album?.images?.[0]?.url,
    duration: t.duration_ms,
    externalUrl: t.external_urls?.spotify,
    previewUrl: t.preview_url,
  }));

export default function SearchScreen({ navigation, route }) {
 const spotifyToken = route.params.token;
 const { AUDD_API_TOKEN } = getEnv();

 const [query, setQuery] = useState("");
 const [loading, setLoading] = useState(false);

const [listening, setListening] = useState(false);
const [detected, setDetected] = useState(null);
const [detectedCover, setDetectedCover] = useState(null);

const [recs, setRecs] = useState([]);
const [error, setError] = useState(null);

  const recordingRef = useRef(null);
  const canUseSpotify = useMemo(() => Boolean(spotifyToken), [spotifyToken]);



  const identifyWithAudD = async (fileUri) => {
    const form = new FormData();
    form.append("api_token", AUDD_API_TOKEN);
    form.append("return", "spotify,apple_music");
    form.append("file", {
      uri: fileUri,
      name: "sample.m4a",
      type: "audio/m4a",
    });

    const res = await fetch("https://api.audd.io/", {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    const title = data?.result?.title;
    const artist = data?.result?.artist;

    if (!title || !artist) {
      throw new Error("No match found. Try again closer to the music.");
    }

    return { title, artist, raw: data?.result };
  };


const spotifySearchTrack = async ({ title, artist }) => {
  const strictQ = `track:${title} artist:${artist}`;
  const broadQ = `${title} ${artist}`;

  const trySearch = async (q) => {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      q
    )}&type=track&limit=1`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${spotifyToken}` },
    });
    return res.data?.tracks?.items?.[0];
  };
  let track = await trySearch(strictQ);
  if (!track) track = await trySearch(broadQ);

  if (!track) throw new Error("Found the song, but Spotify search returned no results.");
  return track;
};

  const spotifyRecommendations = async (seedTrackId) => {
  if (!seedTrackId) return [];

  const url =
    `https://api.spotify.com/v1/recommendations` +
    `?seed_tracks=${seedTrackId}` +
    `&limit=12` +
    `&market=US`;

  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${spotifyToken}` },
  });

  return res.data?.tracks || [];
};



  const stopIfRecording = async () => {
    try {
      const r = recordingRef.current;
      if (r) {
        await r.stopAndUnloadAsync();
        recordingRef.current = null;
      }
    } catch {
      
    }
  };

  const startMicAndIdentify = async () => {
  setError("");
  setDetected(null);
  setDetectedCover(null);
  setRecs([]);

  if (!AUDD_API_TOKEN) {
    setError("Missing AudD API token (AUDD_API_TOKEN).");
    return;
  }

  try {
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) {
      setError("Mic permission denied.");
      return;
    }

    setListening(true);

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    recordingRef.current = recording;

    await recording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    await recording.startAsync();

    setTimeout(async () => {
      try {
        const r = recordingRef.current;
        if (!r) return;

        await r.stopAndUnloadAsync();
        const uri = r.getURI();
        recordingRef.current = null;

        setListening(false);
        setLoading(true);

        const match = await identifyWithAudD(uri);
        setDetected({ title: match.title, artist: match.artist });
        setQuery(`${match.title} — ${match.artist}`);

        if (canUseSpotify) {
      try {
        const seedTrack = await spotifySearchTrack(match);

        setDetectedCover(seedTrack?.album?.images?.[0]?.url ?? null);

        let recommended = [];
        try {
          recommended = await spotifyRecommendations(seedTrack?.id);
        } catch (err) {
          console.log("Recs failed:", err?.response?.status, err?.response?.data);
        }

        if (!recommended?.length) {
          const artistId = seedTrack?.artists?.[0]?.id;
          if (artistId) {
            const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`;
            const res = await axios.get(url, {
              headers: { Authorization: `Bearer ${spotifyToken}` },
            });
            recommended = res.data?.tracks || [];
          }
        }

        setRecs(mapSpotifyTracksToSongCards(recommended));
      } catch (err) {
        console.log("Spotify seed search failed:", err?.response?.status, err?.message);
        if (err?.response?.status === 401) {
          setError("Spotify session expired — reconnect and try again.");
        }
      }
    }
  } catch (e) {
    setError(e?.message || "Recognition failed.");
  } finally {
    setLoading(false);
  }
}, 5000);
  } catch (e) {
    setListening(false);
    setLoading(false);
    setError(e?.message || "Could not start recording.");
    await stopIfRecording();
  }
};


  return (
    <SafeAreaView style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Search</Text>

      {/* White search bar with mic inside */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#7a7a7a" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search songs or artists"
          placeholderTextColor="#8a8a8a"
          style={styles.input}
          returnKeyType="search"
        />
        <Pressable onPress={startMicAndIdentify} style={styles.micBtn}>
          <Ionicons
            name={listening ? "mic" : "mic-outline"}
            size={18}
            color="rgba(0,0,0,0.55)"
          />
        </Pressable>
      </View>

      {/* Status row */}
      {(listening || loading) && (
        <View style={styles.statusRow}>
          <ActivityIndicator />
          <Text style={styles.statusText}>
            {listening ? "Listening…" : "Identifying…"}
          </Text>
        </View>
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}

      {/* Detected result */}
      {detected && (
        <View style={styles.detected}>
          <Text style={styles.detectedTitle}>Do you mean this one?</Text>
          <View style={styles.detectedCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              {detectedCover ? (
                <Image source={{ uri: detectedCover }} style={styles.cover} />
                ) : (
                <View style={styles.coverFallback}>
                    <Ionicons name="musical-notes" size={18} color={Themes.colors.spotify} />
                </View>
                )}

              <View style={{ flex: 1 }}>
                <Text style={styles.detectedSong} numberOfLines={1}>
                  {detected.title}
                </Text>
                <Text style={styles.detectedArtist} numberOfLines={1}>
                  {detected.artist}
                </Text>
              </View>
            </View>
          </View>

          {!canUseSpotify && (
            <Text style={styles.note}>
              Spotify token wasn’t passed to Search, so recommendations are off.
            </Text>
          )}
        </View>
      )}

      {/* Recommendations */}
      {recs.length > 0 && (
        <View style={{ flex: 1, marginTop: 14 }}>
          <Text style={styles.sectionTitle}>Recommended next</Text>
          <SongList tracks={recs} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Themes.colors.background,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  title: {
    color: Themes.colors.white,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    color: "#111",
    fontSize: 14,
  },
  micBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  statusRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusText: {
    color: Themes.colors.gray,
  },
  error: {
    marginTop: 12,
    color: "#ff6b6b",
  },
  detected: {
    marginTop: 18,
    gap: 10,
  },
  detectedTitle: {
    color: Themes.colors.white,
    fontSize: 14,
    fontWeight: "800",
  },
  detectedCard: {
    backgroundColor: "#0f0f0f",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 16,
    padding: 14,
  },
  detectedSong: {
    color: Themes.colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
  detectedArtist: {
    color: Themes.colors.gray,
    marginTop: 2,
  },
  note: {
    color: Themes.colors.gray,
    fontSize: 12,
  },
  sectionTitle: {
    color: Themes.colors.white,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
  },
  cover: {
  width: 44,
  height: 44,
  borderRadius: 10,
},
coverFallback: {
  width: 44,
  height: 44,
  borderRadius: 10,
  backgroundColor: "#151515",
  borderWidth: 1,
  borderColor: "#2a2a2a",
  alignItems: "center",
  justifyContent: "center",
},

});