import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Pressable,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import BottomNav from "./BottomNav";

const Home = () => {
  const [randomRecipes, setRandomRecipes] = useState([]);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const API_KEY = "8bd09a6a0ec64444b1240f14e038989d";

  useEffect(() => {
    fetchRandomRecipes();
  }, []);

  const fetchRandomRecipes = async () => {
    try {
      const response = await axios.get(
        `https://api.spoonacular.com/recipes/random?apiKey=${API_KEY}&number=10&language=es`
      );
      setRandomRecipes(response.data.recipes);
      setError(null);
    } catch (error) {
      console.error("Error fetching random recipes:", error);
      setError("No se pudieron cargar las recetas. Inténtalo nuevamente.");
    }
  };

  return (
    <View style={styles.container}>
        
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      <FlatList
        data={randomRecipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("Detalle de la Receta", { recipeId: item.id })
            }
            style={styles.recipeItem}
            accessibilityLabel={`Ver detalles de ${item.title}`}
          >
            <Image
              source={{ uri: item.image || "https://via.placeholder.com/80" }}
              style={styles.recipeImage}
            />
            <Text style={styles.recipeTitle}>
              {item.title || "Título no disponible"}
            </Text>
          </Pressable>
        )}
        initialNumToRender={5}
        windowSize={10}
      />
      <BottomNav style={styles.bottomNav} navigation={navigation} activeScreen="Home" />
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
    marginBottom: 16,
    textAlign: "center",
    color: "#EF5B23",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
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

export default Home;
