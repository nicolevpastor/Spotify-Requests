import { StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Themes } from "../assets/Themes";
import SongList from "../components/SongList";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { getMyTopTracks } from "../utils/apiOptions";


export default function LibraryScreen({ navigation, route }) {
  const token = route?.params?.token;
  const [tracks, setTracks] = useState(route?.params?.tracks ?? []);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Top Tracks",
      headerStyle: { backgroundColor: Themes.colors.background },
      headerTintColor: Themes.colors.white,
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate("Search", { token })}
          style={{ paddingRight: 12 }}
        >
          <Ionicons name="search" size={22} color={Themes.colors.white} />
        </Pressable>
      ),
    });
  }, [navigation, token]);

  const refreshTracks = async () => {
    if (!token) return;

    try {
      setRefreshing(true);

      const res = await getMyTopTracks(token);

      const formatted = res.map((val) => ({
        songTitle: val.name,
        songArtists: val.artists?.map((a) => ({ name: a.name })) ?? [],
        albumName: val.album?.name,
        imageUrl: val.album?.images?.[0]?.url,
        duration: val.duration_ms,
        externalUrl: val.external_urls?.spotify,
        previewUrl: val.preview_url,
      }));

      setTracks(formatted);
    } catch (e) {
      console.log("refresh failed", e?.message);
    } finally {
      setRefreshing(false);
    }
  };

  return (
  <SafeAreaView style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.title}>Your Library</Text>
      <Text style={styles.subtitle}>
        Check out your top tracks, or tap Search to identify a song playing around you.
      </Text>

      <View style={styles.actions}>
        <Pressable style={styles.actionBtn}>
          <Text style={styles.actionText}>Top Tracks</Text>
        </Pressable>

        <Pressable style={styles.actionBtnSecondary} onPress={refreshTracks}>
          <Text style={styles.actionText}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </Text>
        </Pressable>
      </View>
    </View>

    {tracks.length ? (
      <SongList tracks={tracks} />
    ) : (
      <Text style={styles.empty}>No tracks yet—try Refresh.</Text>
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
  header: {
    gap: 8,
    marginBottom: 10,
  },
  title: {
    color: Themes.colors.white,
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    color: Themes.colors.gray,
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  actionBtn: {
    backgroundColor: Themes.colors.spotify,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  actionBtnSecondary: {
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  actionText: {
    color: Themes.colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  empty: {
    color: Themes.colors.gray,
    textAlign: "center",
    marginTop: 40,
  },
});