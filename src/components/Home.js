import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // Asegúrate de instalar @expo/vector-icons
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../../firebase-config"; // Importa tu configuración de Firestore
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import BottomNav from "./BottomNav";

const Home = () => {
  const [randomRecipes, setRandomRecipes] = useState([]);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState({});
  const navigation = useNavigation();
  const API_KEY = "8bd09a6a0ec64444b1240f14e038989d";

  const API_KEY_GOOGLE = "AIzaSyAauh--gJeN_HHVKY2mW_AF7b89JdQ2LOk";

  // Función para traducir texto usando Google Translate
  const translateText = async (text, sourceLang, targetLang) => {
    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${API_KEY_GOOGLE}&q=${text}&source=${sourceLang}&target=${targetLang}`
      );
      return response.data.data.translations[0].translatedText;
    } catch (error) {
      console.error("Error translating text:", error);
      return text; // Devuelve el texto original si hay un error
    }
  };

  useEffect(() => {
    fetchRandomRecipes();
  }, []);

  const fetchRandomRecipes = async () => {
    try {
      const response = await axios.get(
        `https://api.spoonacular.com/recipes/random?apiKey=${API_KEY}&number=1&language=es` // Cambia el anúmero de recetas aleatorias
      );

      const recetasAleatorias = response.data.recipes;

      const translatedRecipes = await Promise.all(
        recetasAleatorias.map(async (recipe) => {
          const translatedTitle = await translateText(recipe.title, "en", "es");
          return { ...recipe, title: translatedTitle };
        })
      );

      setRandomRecipes(translatedRecipes);
      setError(null);

      // Verificar favoritos para estas recetas
      response.data.recipes.forEach(async (recipe) => {
        const isFavorite = await checkIfFavorite(recipe.id);
        setFavorites((prev) => ({ ...prev, [recipe.id]: isFavorite }));
      });
    } catch (error) {
      console.error("Error fetching random recipes:", error);
      setError("No se pudieron cargar las recetas. Inténtalo nuevamente.");
    }
  };

  const checkIfFavorite = async (recipeId) => {
    const user = auth.currentUser;
    if (!user) return false; // Si el usuario no está autenticado, no puede tener favoritos

    const userId = user.uid;
    const docRef = doc(db, "users", userId, "favorites", recipeId.toString());

    try {
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error("Error checking favorite:", error);
      return false;
    }
  };

  const toggleFavorite = async (recipe) => {
    const user = auth.currentUser; // Obtén el usuario actual
    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión para agregar favoritos.");
      return;
    }

    const userId = user.uid; // UID del usuario actual
    const recipeId = recipe.id.toString();
    const docRef = doc(db, "users", userId, "favorites", recipeId); // Ruta de Firestore

    try {
      if (favorites[recipeId]) {
        // Eliminar de favoritos
        await deleteDoc(docRef);
        Alert.alert("Eliminado de favoritos", `${recipe.title} eliminado.`);
      } else {
        // Agregar a favoritos
        await setDoc(docRef, {
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
        });
        Alert.alert("Agregado a favoritos", `${recipe.title} agregado.`);
      }

      // Actualizar estado local
      setFavorites((prev) => ({ ...prev, [recipeId]: !prev[recipeId] }));
    } catch (error) {
      console.error("Error al manejar favorito:", error);
      Alert.alert("Error", "No se pudo actualizar el favorito.");
    }
  };

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Text style={styles.title}>Recetas Aleatorias</Text>
      <FlatList
        data={randomRecipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.recipeItem}>
            <Pressable
              onPress={() =>
                navigation.navigate("Detalle de la Receta", {
                  recipeId: item.id,
                })
              }
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Image
                source={{ uri: item.image || "https://via.placeholder.com/80" }}
                style={styles.recipeImage}
              />
              <Text style={styles.recipeTitle}>
                {item.title || "Título no disponible"}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => toggleFavorite(item)}
              accessibilityLabel={
                favorites[item.id]
                  ? "Eliminar de favoritos"
                  : "Agregar a favoritos"
              }
            >
              <MaterialIcons
                name={favorites[item.id] ? "favorite" : "favorite-border"}
                size={28}
                color={favorites[item.id] ? "red" : "gray"}
              />
            </Pressable>
          </View>
        )}
        initialNumToRender={5}
        windowSize={10}
      />
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
    marginBottom: 16,

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
