import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import RecipeItem from "../components/RecipeItem";
import {
  fetchRecipesWithFavorites,
  toggleFavorite,
} from "../viewModels/HomeViewModel";
import { auth } from "../../firebase-config";
import BottomNav from "../components/BottomNav";

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const user = auth.currentUser;
      const { recipes, favorites } = await fetchRecipesWithFavorites(user?.uid);
      setRecipes(recipes);
      setFavorites(favorites);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleToggleFavorite = async (recipe) => {
    const user = auth.currentUser;
    if (!user) return;

    const isFavorite = favorites[recipe.id];
    await toggleFavorite(recipe, user.uid, isFavorite);

    setFavorites((prev) => ({ ...prev, [recipe.id]: !isFavorite }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recetas Aleatorias</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <View style={styles.recipeList}>
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <RecipeItem
              item={item}
              isFavorite={favorites[item.id]}
              onToggleFavorite={() => handleToggleFavorite(item)}
              onNavigate={() =>
                navigation.navigate("Detalle de la Receta", {
                  recipeId: item.id,
                })
              }
            />
          )}
        />
      </View>

      <BottomNav
        style={styles.bottomNav}
        navigation={navigation}
        activeScreen="Home"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 16,

    color: "#EF5B23",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  recipeList: {
    maxHeight: "85%",
  },
});

export default Home;
