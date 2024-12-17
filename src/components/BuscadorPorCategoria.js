import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { auth, db } from "../../firebase-config";
import { doc, setDoc, deleteDoc, getDoc, collection } from "firebase/firestore";

// Función para generar la fecha en formato dinámico "YYYY-MM-DD"
const getFormattedDate = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Mes en formato 2 dígitos
  const day = String(today.getDate()).padStart(2, "0"); // Día en formato 2 dígitos
  return `${year}-${month}-${day}`;
};

const BuscadorPorCategoria = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const route = useRoute();
  const { mealName } = route.params;
  const [recetas, setRecetas] = useState([]);
  const [recetasPorIngredientes, setRecetasPorIngredientes] = useState([]);
  const [recetasPorAlgunosIngredientes, setRecetasPorAlgunosIngredientes] =
    useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState(
    []
  );
  const [activeView, setActiveView] = useState("recetas");
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favorites, setFavorites] = useState({});
  const [recipes, setRecipes] = useState([]);

  const API_KEY_GOOGLE = "AIzaSyAauh--gJeN_HHVKY2mW_AF7b89JdQ2LOk";
  //const API_KEY = "8bd09a6a0ec64444b1240f14e038989d";
  //const API_KEY = "a0b302c65fee4b93a470fd535ced1281";
  const API_KEY = "726d82e66425488aac3d9c5d5bea656a";
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

  // Función para traducir nombres de ingredientes seleccionados
  const translateSelectedIngredients = async () => {
    try {
      // Traducir cada nombre de ingrediente al inglés
      const translatedIngredients = await Promise.all(
        ingredientesSeleccionados.map(async (ingredient) => {
          const translatedName = await translateText(
            ingredient.name,
            "es",
            "en"
          );
          return { ...ingredient, name: translatedName };
        })
      );
      return translatedIngredients;
    } catch (error) {
      console.error("Error translating selected ingredients:", error);
      return ingredientesSeleccionados; // Retorna los ingredientes originales si hay un error
    }
  };

  const searchRecetas = async (searchQuery) => {
    try {
      const traslatedQuery = await translateText(searchQuery, "es", "en");
      const response = await axios.get(
        `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${traslatedQuery}&number=10`
      );

      const recetas = response.data.results;

      // Paso 3: Traduce los títulos de las recetas de inglés a español
      const translatedRecipes = await Promise.all(
        recetas.map(async (recipe) => {
          const translatedTitle = await translateText(recipe.title, "en", "es");
          return { ...recipe, title: translatedTitle };
        })
      );

      setRecetas(translatedRecipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const searchIngredients = async (searchQuery) => {
    try {
      const traslatedQuery = await translateText(searchQuery, "es", "en");
      const response = await axios.get(
        `https://api.spoonacular.com/food/ingredients/search?apiKey=${API_KEY}&query=${traslatedQuery}&number=3&sortDirection=desc` // Cambia el número de ingredientes
      );

      const ingredientes = response.data.results;

      // Paso 3: Traduce los títulos de las recetas de inglés a español
      const translatedRecipes = await Promise.all(
        ingredientes.map(async (recipe) => {
          console.log(recipe.name);
          const translatedTitle = await translateText(recipe.name, "en", "es");
          return { ...recipe, name: translatedTitle };
        })
      );

      setIngredientes(translatedRecipes);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  // busqueda segun ingredientes
  const searchRecetasPorIngredientes = async () => {
    try {
      const translatedIngredients = await translateSelectedIngredients();
      const ingredientesQuery = translatedIngredients
        .map((ingredient) => ingredient.name)
        .join(",");
      const response = await axios.get(
        `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${API_KEY}&ingredients=${ingredientesQuery}&ranking=2&number=2`
      );

      const ingredientes = response.data;

      // Paso 3: Traduce los títulos de las recetas de inglés a español
      const translatedRecipes = await Promise.all(
        ingredientes.map(async (recipe) => {
          const translatedTitle = await translateText(recipe.title, "en", "es");
          return { ...recipe, title: translatedTitle };
        })
      );
      setRecetasPorIngredientes(translatedRecipes);
    } catch (error) {
      console.error("Error fetching recipes by ingredients:", error);
    }
  };

  // busqueda segun ingredientes
  const searchRecetasPorAlgunosIngredientes = async () => {
    try {
      const translatedIngredients = await translateSelectedIngredients();
      const ingredientesQuery = translatedIngredients
        .map((ingredient) => ingredient.name)
        .join(",");
      const response = await axios.get(
        `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${API_KEY}&ingredients=${ingredientesQuery}&ranking=1&number=2`
      );
      const ingredientes = response.data;

      // Paso 3: Traduce los títulos de las recetas de inglés a español
      const translatedRecipes = await Promise.all(
        ingredientes.map(async (recipe) => {
          const translatedTitle = await translateText(recipe.title, "en", "es");
          console.log("receta por algunosingrediente", translatedTitle);
          return { ...recipe, title: translatedTitle };
        })
      );

      setRecetasPorAlgunosIngredientes(translatedRecipes);
    } catch (error) {
      console.error("Error fetching recipes by ingredients:", error);
    }
  };

  // Maneja la búsqueda de recetas o ingredientes
  const handleSearch = (text) => {
    setQuery(text);
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const newTimeout = setTimeout(() => {
      if (activeView === "recetas") {
        searchRecetas(text);
      } else {
        searchIngredients(text);
      }
    }, 500);
    setDebounceTimeout(newTimeout);
  };

  const handleIngredientSelect = (ingredient) => {
    if (!ingredientesSeleccionados.some((item) => item.id === ingredient.id)) {
      setIngredientesSeleccionados([...ingredientesSeleccionados, ingredient]);
    }
    setIngredientes([]); // Limpiar la lista de ingredientes
    setQuery(""); // Limpiar el campo de búsqueda
    searchRecetasPorIngredientes();
    searchRecetasPorAlgunosIngredientes();
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

  const isRecipeAdded = (recipeId) => {
    return recipes.some((r) => r.id === recipeId);
  };

  const handleAddFavoriteToMeal = async (favoriteRecipe) => {
    if (isRecipeAdded(favoriteRecipe.id)) {
      Alert.alert("Advertencia", "Esta receta ya está añadida.");
      return;
    }
    try {
      const snapshot = await getDoc(mealDocRef);
      const data = snapshot.exists() ? snapshot.data() : { recetas: [] };

      const response = await axios.get(
        `https://api.spoonacular.com/recipes/${favoriteRecipe.id}/information?apiKey=${API_KEY}&includeNutrition=true`
      );

      const recetas = response.data;

      const nutrientesDeseados = ["Carbohydrates", "Protein", "Fat"]; // Añade aquí los nutrientes que necesitas
      const nutrientesSeleccionados = recetas.nutrition.nutrients
        .filter((nutriente) => nutrientesDeseados.includes(nutriente.name))
        .map((nutriente) => ({
          name: nutriente.name,
          amount: nutriente.amount,
        }));

      const food = {
        // Usamos el título de la receta favorita
        carbohydrates:
          nutrientesSeleccionados.find(
            (nutriente) => nutriente.name === "Carbohydrates"
          )?.amount || 0,
        protein:
          nutrientesSeleccionados.find(
            (nutriente) => nutriente.name === "Protein"
          )?.amount || 0,
        fat:
          nutrientesSeleccionados.find((nutriente) => nutriente.name === "Fat")
            ?.amount || 0,
      };

      const snapshotNutrients = await getDoc(dailyMenuRef);
      if (snapshotNutrients.exists()) {
        const dailyMenuData = snapshotNutrients.data();
        if (dailyMenuData.nutrientes) {
          const nutrientsData = dailyMenuData.nutrientes;
          // Sumar los nutrientes de la receta a los nutrientes totales
          const updatedNutrients = {
            carbohydrates: nutrientsData.carbohydrates + food.carbohydrates,
            protein: nutrientsData.protein + food.protein,
            fat: nutrientsData.fat + food.fat,
          };

          // Actualizar los nutrientes totales en Firestore
          await setDoc(
            dailyMenuRef,
            { nutrientes: updatedNutrients },
            { merge: true }
          );

          console.log(
            "Nutrientes actualizados en Firestore:",
            updatedNutrients
          );
        }
      }
      // Crear una nueva lista de recetas con la receta añadida
      const updatedRecipes = [
        ...data.recetas,
        {
          id: favoriteRecipe.id,
          recipeName: favoriteRecipe.title, // Usamos el título de la receta favorita
          imageUrl: favoriteRecipe.image || "https://via.placeholder.com/150",
        },
      ];

      // Actualizar Firestore
      await setDoc(mealDocRef, { recetas: updatedRecipes }, { merge: true });

      // Actualizar el estado local de recipes
      setRecipes(updatedRecipes);

      // Actualizar el estado de favoriteRecipes para eliminar la receta añadida
      /*setFavoriteRecipes((prevFavorites) =>
        prevFavorites.filter((recipe) => recipe.id !== favoriteRecipe.id)
      );*/

      Alert.alert("Éxito", `${favoriteRecipe.title} añadida a ${mealName}`);
    } catch (error) {
      Alert.alert("Error", "No se pudo añadir la receta");
      console.error(error);
    }
  };

  const userId = auth.currentUser?.uid; // ID del usuario logueado
  const date = getFormattedDate(); // Fecha actual formateada dinámicamente

  const dailyMenuRef = doc(db, `users/${userId}/dailyMenu/${date}`);
  // Referencia al documento del tipo de comida
  const comidasRef = collection(dailyMenuRef, "comidas");
  const mealDocRef = doc(comidasRef, mealName); // Documento específico del mealType

  // Obtener recetas desde Firestore
  const fetchRecipes = async () => {
    try {
      const snapshot = await getDoc(mealDocRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const fetchedRecipes = data.recetas || []; // Recuperamos el campo 'recetas'
        setRecipes(fetchedRecipes);
      } else {
        setRecipes([]); // Si no existe el documento, inicializamos vacío
      }
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar las recetas");
      console.error(error);
    }
  };

  useEffect(() => {
    const initializeAndFetch = async () => {
      fetchRecipes(); // Cargar recetas
    };
    initializeAndFetch();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Buscar receta o ingrediente..."
          placeholderTextColor="#C9C7D0"
          value={query}
          onChangeText={handleSearch}
        />
        <FontAwesome
          name="search"
          size={24}
          color="#C9C7D0"
          style={styles.iconoSearch}
        />
      </View>

      <FlatList
        contentContainerStyle={styles.listElements}
        data={recetas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("Detalle de la Receta", { recipeId: item.id })
            }
            style={styles.recipeItem}
          >
            <Image source={{ uri: item.image }} style={styles.recipeImage} />
            <Text style={styles.recipeTitle}>{item.title}</Text>
            {isRecipeAdded(item.id) ? (
              // Ícono verde si la receta ya está añadida
              <MaterialIcons name="check-circle" size={32} color="green" />
            ) : (
              // Ícono de añadir si no está añadida
              <Pressable
                style={styles.addIconButton}
                onPress={() => handleAddFavoriteToMeal(item)}
              >
                <MaterialIcons name="add-circle" size={32} color="#EF5B23" />
              </Pressable>
            )}
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: "100%",
    height: "100%",
  },
  input: {
    borderWidth: 1,
    padding: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: "100%",
    borderColor: "#C9C7D0",
  },
  inputContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 15,
  },
  iconoSearch: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  recipeItem: {
    flexDirection: "row",
    alignItems: "center",
    width: 355,
    height: 51,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#E6E6E6",
    elevation: 3,
    paddingEnd: 10,
  },

  recipeImage: {
    width: 100,
    height: 50,
    marginRight: 10,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    resizeMode: "stretch",
  },
  recipeTitle: {
    fontSize: 16,
    flex: 1,
    paddingEnd: 5,
  },
  listElements: {
    width: "100%",
    marginTop: 20,
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  btns: {
    width: "100%",
    padding: 10,
    height: 45,
    borderRadius: 10,
    backgroundColor: "#C9C7D0",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  btnOptions: {
    width: "45%",
    padding: 5,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#C9C7D0",
    alignItems: "center",
    justifyContent: "center",
  },
  activeBtn: {
    backgroundColor: "#FFFEFE",
  },
  activeText: {
    color: "black",
  },
  inactiveText: {
    color: "white",
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
    color: "#EF5B23",
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: "bold",
  },
  ingredientItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  ingredientText: {
    fontSize: 16,
  },
  selectedIngredientItem: {
    padding: 8,
    backgroundColor: "#FFFEFE",
    elevation: 7,
    borderRadius: 20,
    marginVertical: 5,
    marginLeft: 10,
    width: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  listIngredients: {
    flexDirection: "row",
  },
  listaDesplegable: {
    position: "absolute",
    width: "81.5%",
    top: 60, // Ajusta según la posición del input
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    maxHeight: 200,
    zIndex: 1,
    marginLeft: 48,
  },
});

export default BuscadorPorCategoria;
