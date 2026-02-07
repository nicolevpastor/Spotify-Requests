import {
  FlatList,
  Text,
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { Themes } from "../assets/Themes";
import Song from "./Song";
import { useNavigation } from "@react-navigation/native";

const renderSong = ({ item, index }) => (
  <Song
    index={index}
    imageUrl={item.imageUrl}
    songTitle={item.songTitle}
    songArtists={item.songArtists}
    albumName={item.albumName}
    duration={item.duration}
  />
);


const SongList = ({ tracks }) => {
//console.log("artist", tracks[0].songArtists);
  return (
    <View style={styles.container}>
      <FlatList
        data={tracks}
        renderItem={renderSong}
        keyExtractor={(item, index) => `${item.songTitle}-${index}`}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

//allows us to style the song list container and text
const styles = StyleSheet.create({
  container: {
    flex: 1,
  backgroundColor: Themes.colors.background,
  },
  text: {
    color: Themes.colors.gray,
  },
});

export default SongList;
