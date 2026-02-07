import { Pressable, Text, StyleSheet } from "react-native";
import { Themes } from "../assets/Themes";

const SpotifyAuthButton = ({ authenticationFunction }) => {
  return (
    <Pressable style={styles.authButton} onPress={authenticationFunction}>
      <Text style={styles.authText}>Connect with Spotify</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  authButton: {
  backgroundColor: Themes.colors.spotify,
  paddingVertical: 14,
  paddingHorizontal: 18,
  borderRadius: 999999,
  alignItems: "center",
},
authText: {
  color: "white",
  fontWeight: "800",
  fontSize: 16,
},

});

export default SpotifyAuthButton;