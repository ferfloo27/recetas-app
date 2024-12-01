import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../firebase-config";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons"; // Importa el ícono de Ionicons
import BottomNav from "./BottomNav";
import axios from "axios";

const Favoritos = () => {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]); // Estado para las recetas favoritas
  const [error, setError] = useState(null);
  const navigation = useNavigation();

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

  // Método para obtener las recetas favoritas de Firestore
  const fetchFavoritesForUser = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError("No hay un usuario logueado");
      return;
    }

    const userId = user.uid;
    const favoritesCollectionRef = collection(db, "users", userId, "favorites");

    try {
      const querySnapshot = await getDocs(favoritesCollectionRef);
      const favoritesData = querySnapshot.docs
        .map((doc) => ({
          id: doc.id, // ID del documento (receta)
          ...doc.data(), // Información adicional de la receta
        }))
        .filter((recipe) => recipe.id && recipe.title); // Filtra recetas incompletas

      const translatedRecipes = await Promise.all(
        favoritesData.map(async (recipe) => {
          const translatedTitle = await translateText(recipe.title, "en", "es");
          return { ...recipe, title: translatedTitle };
        })
      );

      setFavoriteRecipes(translatedRecipes); // Actualiza el estado con las recetas válidas
    } catch (error) {
      console.error("Error al cargar favoritos:", error);
      setError("No se pudieron cargar las recetas favoritas.");
    }
  };

  // Método para eliminar una receta de los favoritos
  const toggleFavorite = async (recipeId) => {
    const user = auth.currentUser;
    if (!user) return;

    const userId = user.uid;
    const recipeDocRef = doc(db, "users", userId, "favorites", recipeId);

    try {
      // Eliminar receta de Firestore
      await deleteDoc(recipeDocRef);

      // Actualizar la lista local de favoritos eliminando la receta
      setFavoriteRecipes((prevFavorites) =>
        prevFavorites.filter((id) => id !== recipeId)
      );
      fetchFavoritesForUser();
    } catch (error) {
      console.error("Error al eliminar favorito:", error);
    }
  };

  useEffect(() => {
    fetchFavoritesForUser(); // Llama a la función cuando el componente se monte
  }, []);

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Text style={styles.title}>Tus recetas favoritas:</Text>

      {favoriteRecipes.length === 0 ? (
        <Text style={styles.noFavoritesText}>
          No tienes recetas favoritas guardadas.
        </Text>
      ) : (
        <FlatList
          data={favoriteRecipes} // Las recetas favoritas ya filtradas
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable
              style={styles.recipeItem}
              onPress={() =>
                navigation.navigate("Detalle de la Receta", {
                  recipeId: item.id,
                })
              }
            >
              <Image
                source={{ uri: item.image || "https://via.placeholder.com/80" }}
                style={styles.recipeImage}
              />

              <Text style={styles.recipeTitle}>{item.title}</Text>
              <Pressable
                onPress={() => toggleFavorite(item.id.toString())} // Elimina el favorito
              >
                <MaterialIcons
                  name="favorite" // Corazón lleno
                  size={24}
                  color="#EF5B23" // Color del icono (puedes cambiarlo)
                />
              </Pressable>
            </Pressable>
          )}
          initialNumToRender={5}
          windowSize={10}
        />
      )}

      <BottomNav
        style={styles.bottomNav}
        navigation={navigation}
        activeScreen="Favoritos"
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
    textAlign: "center",
    color: "#EF5B23",
  },
  noFavoritesText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
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
});

export default Favoritos;
