// screens/SecondScreen.js
import React, { useState, useEffect, useCallback, use } from "react";
import axios from "axios";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { auth, db } from "../../firebase-config";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

export default function DetalleView() {
  const route = useRoute();
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [ingredientes, setIngredientes] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [isFavorite, setIsFavorite] = useState(false);
  const userId = auth.currentUser?.uid;
  const [steps, setSteps] = useState([]);

  const navigation = useNavigation();

  const API_KEY = "726d82e66425488aac3d9c5d5bea656a";
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
    const obtenerDetalles = async () => {
      try {
        const response = await axios.get(
          `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}&includeNutrition=false`
        );

        const recetas = response.data;

        const translatedRecipes = {
          ...recetas,
          title: await translateText(recetas.title, "en", "es"),
          summary: await translateText(recetas.summary, "en", "es"),
          instructions: await translateText(recetas.instructions, "en", "es"),
        };

        setRecipe(translatedRecipes);

        const translatedIngredients = await Promise.all(
          recetas.extendedIngredients.map(async (ingredient) => {
            const translatedName = await translateText(
              ingredient.original,
              "en",
              "es"
            );

            return { ...ingredient, original: translatedName };
          })
        );

        setIngredientes(translatedIngredients || []);

        // Traducimos los pasos (analyzedInstructions)
        const translatedSteps =
          recetas.analyzedInstructions?.flatMap((instruction) =>
            instruction.steps.map(async (step) => {
              const translatedStep = await translateText(step.step, "en", "es");
              return { ...step, step: translatedStep };
            })
          ) || [];

        // Resolvemos las promesas para obtener los pasos traducidos
        const resolvedSteps = await Promise.all(translatedSteps);

        setSteps(resolvedSteps); // Asignamos los pasos traducidos a un estado
        console.log("steps", steps);
        setFavorites((prev) => ({ ...prev, [recipeId]: isFavorite }));
      } catch (error) {
        console.error("Error fetching recipe details:", error);
      }
    };

    obtenerDetalles();
  }, [recipeId]);

  const toggleFavorite = async () => {
    const user = userId; // Obtén el usuario actual
    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión para agregar favoritos.");
      return;
    }
    // UID del usuario actual
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

  useEffect(() => {
    const checkIfFavorite = async (recipeId) => {
      const user = auth.currentUser;
      if (!user) return false; // Si el usuario no está autenticado, no puede tener favoritos

      const userId = user.uid;
      const docRef = doc(db, "users", userId, "favorites", recipeId.toString());

      try {
        const docSnap = await getDoc(docRef);
        console.log("docSnap.exists()", docSnap.exists());
        if (docSnap.exists()) {
          setIsFavorite(true);
        } else {
          setIsFavorite(false);
        }
      } catch (error) {
        console.error("Error checking favorite:", error);
      }
    };
    checkIfFavorite(recipeId);
  }, [favorites, recipeId]);

  return (
    <View style={styles.container}>
      {/* Contenido principal */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Título y favorito */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{recipe?.title}</Text>
          <Pressable
            onPress={() => toggleFavorite()}
            accessibilityLabel={
              isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos"
            }
          >
            <MaterialIcons
              name={isFavorite ? "favorite" : "favorite-border"}
              size={28}
              color={isFavorite ? "red" : "gray"}
            />
          </Pressable>
        </View>

        {/* Imagen */}
        <Image
          source={{ uri: `${recipe?.image}` }}
          style={styles.recipeImage}
        />

        {/* Ingredientes */}
        <Text style={styles.sectionTitle}>Ingredientes:</Text>
        {ingredientes.map((item) => (
          <View key={item.id} style={styles.ingredientContainer}>
            <Text style={styles.ingredientText}>{item.original}</Text>
            <FontAwesome
              name="external-link"
              size={18}
              color="#EF5B23"
              onPress={() =>
                navigation.navigate("Detalle del ingrediente", {
                  ingredienteId: item.id,
                })
              }
            />
          </View>
        ))}

        {/* Resumen */}
        <Text style={styles.sectionTitle}>Resumen:</Text>
        <Text style={styles.summaryText}>
          {recipe?.summary?.replace(/<[^>]+>/g, "") || "No disponible."}
        </Text>

        {/* Preparación */}
        <Text style={styles.sectionTitle}>Preparación:</Text>
        {steps.length > 0 ? (
          steps.map((step, index) => (
            <View key={index} style={styles.stepContainer}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              <Text style={styles.stepText}>{step.step}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.stepText}>Pasos no disponibles.</Text>
        )}
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
    marginLeft: 10,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  stepContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 5,
    fontSize: 16,
    color: "black",
  },
  stepNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#EF5B23",
    marginRight: 10,
  },
  stepText: {
    fontSize: 16,
    color: "black",
  },
  title: {
    fontSize: 24,
    flex: 1,
    fontWeight: "bold",
    color: "#EF5B23",
    textAlign: "center",
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  ingredientText: {
    flex: 1,
    fontSize: 16,
    color: "black",
  },
  ingredientContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 16,
    color: "black",
    marginBottom: 20,
  },
  preparationText: {
    fontSize: 16,
    color: "black",
    marginBottom: 20,
  },
});
