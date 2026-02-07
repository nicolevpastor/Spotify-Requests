import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSpotifyAuth } from "../utils";
import { Themes } from "../assets/Themes";
import SpotifyAuthButton from "../components/SpotifyAuthButton";
import SongList from "../components/SongList";
import { useEffect } from "react";


export default function HomeScreen({ navigation, route }) {
  // Pass in true to useSpotifyAuth to use the album ID (in env.js) instead of top tracks
  const { token, tracks, getSpotifyAuth } = useSpotifyAuth();
  let contentDisplayed = null;

if (token) {
  contentDisplayed = <SongList tracks={tracks} />;


} else {
  contentDisplayed = (
    <SpotifyAuthButton authenticationFunction={getSpotifyAuth} />
  );
}

useEffect(() => {
  if (token && tracks?.length) {
    navigation.replace("Library", { tracks, token });
  }
}, [token, tracks, navigation]);



return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Spotify Mini</Text>
        <Text style={styles.subtitle}>
          Your top tracks, plus song recognition on demand.{"\n"}Connect your Spotify account to get started.
        </Text>

        <Text style={styles.featuresLabel}>Features</Text>
        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Top Tracks</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Search</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <SpotifyAuthButton authenticationFunction={getSpotifyAuth} />
        <Text style={styles.caption}>
          We only use Spotify to show your music in-app.
        </Text>
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );

}


const styles = StyleSheet.create({
  container: {
    backgroundColor: Themes.colors.background,
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  hero: {
    gap: 14,
  },
  title: {
    color: Themes.colors.white,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  subtitle: {
    color: Themes.colors.gray,
    fontSize: 16,
    lineHeight: 22,
  },
  featuresLabel: {
  color: Themes.colors.gray,
  fontSize: 12,
  fontWeight: "700",
  letterSpacing: 0.8,
  marginBottom: 8,
  marginTop: 16,
  textTransform: "uppercase",
},
chip: {
  backgroundColor: "#111",
  borderWidth: 1,
  borderColor: "#2a2a2a",
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 999,
},
  chipsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#2a2a2a",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#111111",
  },
  chipText: {
    color: Themes.colors.white,
    fontSize: 12,
  },
  footer: {
    gap: 10,
  },
  caption: {
    color: Themes.colors.gray,
    fontSize: 12,
    textAlign: "center",
  },
});