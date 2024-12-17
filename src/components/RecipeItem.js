import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const RecipeItem = ({ item, isFavorite, onToggleFavorite, onNavigate }) => {
  return (
    <View style={styles.recipeItem}>
      <Pressable
        onPress={onNavigate}
        style={{ flexDirection: "row", flex: 1, alignItems: "center" }}
      >
        <Image source={{ uri: item.image }} style={styles.recipeImage} />
        <Text style={styles.recipeTitle}>{item.title}</Text>
      </Pressable>
      <Pressable onPress={onToggleFavorite}>
        <MaterialIcons
          name={isFavorite ? "favorite" : "favorite-border"}
          size={28}
          color={isFavorite ? "red" : "gray"}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  recipeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    elevation: 3,
    padding: 10,
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
});

export default RecipeItem;
