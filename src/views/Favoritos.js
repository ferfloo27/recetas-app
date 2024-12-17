import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import BottomNav from "../components/BottomNav";
import useFavoritesViewModel from "../viewModels/FavoritesViewModel";
import { useNavigation } from "@react-navigation/native";

const Favoritos = () => {
  const navigation = useNavigation();
  const { favoriteRecipes, error, removeFavorite } = useFavoritesViewModel();

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Text style={styles.title}>Tus recetas favoritas:</Text>

      {favoriteRecipes.length === 0 ? (
        <Text style={styles.noFavoritesText}>
          No tienes recetas favoritas guardadas.
        </Text>
      ) : (
        <View style={styles.recipeList}>
          <FlatList
            data={favoriteRecipes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.recipeItem}>
                <Pressable
                  onPress={() =>
                    navigation.navigate("Detalle de la Receta", {
                      recipeId: item.id,
                    })
                  }
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.recipeImage}
                  />
                  <Text style={styles.recipeTitle}>{item.title}</Text>
                </Pressable>
                <Pressable onPress={() => removeFavorite(item.id)}>
                  <MaterialIcons name="favorite" size={24} color="#EF5B23" />
                </Pressable>
              </View>
            )}
          />
        </View>
      )}

      <BottomNav navigation={navigation} activeScreen="Favoritos" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EF5B23",
    textAlign: "center",
    marginTop: 16,
  },
  noFavoritesText: { textAlign: "center", color: "#999", marginTop: 20 },
  recipeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    elevation: 3,
    padding: 10,
  },
  recipeList: {
    maxHeight: "85%",
  },
  recipePressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  recipeTitle: {
    fontSize: 18,
    flex: 1,
    color: "#333",
  },
  favoriteIcon: {
    padding: 8,
  },
  recipeList: {
    maxHeight: "85%",
  },
});

export default Favoritos;
