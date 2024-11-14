// screens/SecondScreen.js
import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import { FlatList } from "react-native-gesture-handler";
import { useRoute } from "@react-navigation/native";

export default function DetalleView() {
  const route = useRoute();
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [ingredientes, setIngredientes] = useState([]);

  const API_KEY = "8bd09a6a0ec64444b1240f14e038989d";

  useEffect(() => {
    const obtenerDetalles = async () => {
      try {
        const response = await axios.get(
          `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}&includeNutrition=false`
        );
        setRecipe(response.data);
        setIngredientes(response.data.extendedIngredients);
      } catch (error) {
        console.error("Error translating text:", error);
        console.error("Error fetching recipes:", error);
      }
    };

    obtenerDetalles();
  }, [recipeId]);

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchInput}>Buscar</Text>
        <FontAwesome
          name="search"
          size={20}
          color="gray"
          style={styles.searchIcon}
        />
      </View>

      {/* Contenido principal */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{recipe?.title}</Text>
        <FontAwesome
          name="heart-o"
          size={24}
          color="gray"
          style={styles.favoriteIcon}
        />

        <Image
          source={{ uri: `${recipe?.image}` }} // Cambia a la URL de tu imagen
          style={styles.recipeImage}
        />

        {/* Sección de ingredientes */}
        <Text style={styles.sectionTitle}>Ingredientes:</Text>
        <View style={styles.ingredientItem}>
          <FlatList
            data={ingredientes}
            renderItem={({ item }) => (
              <View style={styles.ingredientContainer}>
                <Text style={styles.ingredientText}>{item.original}</Text>
                <FontAwesome name="external-link" size={18} color="#EF5B23" />
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>

        {/* Sección de resumen */}
        <Text style={styles.sectionTitle}>Resumen</Text>
        <Text style={styles.summaryText}>{recipe?.summary}</Text>

        {/* Sección de preparación */}
        <Text style={styles.sectionTitle}>Preparación:</Text>
        <Text style={styles.preparationText}>
          En una sartén ponemos el aceite de oliva y dejamos que caliente un
          poco. Luego añadimos los huevos al sartén y batimos con calma a medida
          que se vayan cociendo. Cuando tengan la consistencia deseada se retira
          del fuego y se añade la sal y pimienta.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEF6F0",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF931E",
    padding: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#FEF6F0",
    padding: 8,
    borderRadius: 20,
    paddingHorizontal: 15,
    color: "gray",
  },
  searchIcon: {
    marginLeft: -30,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EF5B23",
    textAlign: "center",
    marginBottom: 10,
  },
  favoriteIcon: {
    position: "absolute",
    top: 10,
    right: 20,
  },
  recipeImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EF5B23",
    marginVertical: 10,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
    color: "black",
  },
  ingredientContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  preparationText: {
    fontSize: 16,
    color: "black",
    marginBottom: 20,
  },
});
