import React, {
  useState,
  useEffect,
  use,
  useCallback,
  useLayoutEffect,
} from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { db, auth } from "../../firebase-config"; // Importa tu configuración de Firebase
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  collection,
} from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons"; // Importa el ícono de Ionicons
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import axios from "axios";

// Función para generar la fecha en formato dinámico "YYYY-MM-DD"
const getFormattedDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Mes en formato 2 dígitos
  const day = String(today.getDate()).padStart(2, "0"); // Día en formato 2 dígitos
  return `${year}-${month}-${day}`;
};

const AddRecet = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mealName } = route.params || {}; // Tipo de comida: "Desayuno", "Almuerzo", etc.
  const [recipes, setRecipes] = useState([]);
  const userId = auth.currentUser?.uid; // ID del usuario logueado
  const date = getFormattedDate(); // Fecha actual formateada dinámicamente

  const [favoriteRecipes, setFavoriteRecipes] = useState([]); // Estado para las recetas favoritas
  const [error, setError] = useState(null);
  const [mealRecipes, setMealRecipes] = useState([]);

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

  if (!userId) {
    Alert.alert("Error", "No se pudo obtener el usuario logueado");
    return null;
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() =>
            navigation.navigate("BuscadorPorCategoria", { mealName })
          }
          style={{ marginRight: 10 }}
        >
          <FontAwesome name="search" size={24} color="#fff" />
        </Pressable>
      ),
    }); // Llama a la función para inicializar el documento del tipo de comida
  }, []);

  const dailyMenuRef = doc(db, `users/${userId}/dailyMenu/${date}`);
  // Referencia al documento del tipo de comida
  const comidasRef = collection(dailyMenuRef, "comidas");
  const mealDocRef = doc(comidasRef, mealName); // Documento específico del mealType

  // Inicializar el documento del tipo de comida si no existe
  const initializeMealDoc = async () => {
    try {
      const snapshot = await getDoc(dailyMenuRef);
      if (snapshot.exists()) {
        const dailyMenuData = snapshot.data();
        if (!dailyMenuData.nutrientes) {
          await updateDoc(dailyMenuRef, {
            nutrientes: {
              carbohydrates: 0,
              protein: 0,
              fat: 0,
            },
          });
        } else {
          console.log(
            "Documento dailyMenu ya inicializado con el campo nutrientes."
          );
        }
        // Crear el documento principal con nutrientes
      } else {
        await setDoc(dailyMenuRef, {
          nutrientes: {
            carbohydrates: 0,
            protein: 0,
            fat: 0,
          },
        });
        console.log("Documento dailyMenu creado con el campo nutrientes.");
      }

      // Verificar si el documento del tipo de comida ya existe
      const mealSnapshot = await getDoc(mealDocRef);

      if (!mealSnapshot.exists()) {
        // Crear el documento para el tipo de comida
        await setDoc(mealDocRef, { recetas: [] }); // Crear el documento vacío
        console.log(`Documento creado para ${mealName}`);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo inicializar el documento");
      console.error(error);
    }
  };

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

  // Añadir una nueva receta
  const addRecipe = async (recipe) => {
    try {
      const snapshot = await getDoc(mealDocRef);
      const data = snapshot.exists() ? snapshot.data() : { recetas: [] };

      const updatedRecipes = [...data.recetas, recipe];

      await setDoc(mealDocRef, { recetas: updatedRecipes }, { merge: true });
      setRecipes((prev) => [...prev, recipe]); // Actualizamos el estado local
    } catch (error) {
      Alert.alert("Error", "No se pudo agregar la receta");
      console.error(error);
    }
  };

  useEffect(() => {
    const initializeAndFetch = async () => {
      await initializeMealDoc(); // Asegurarnos de que el documento existe
      fetchRecipes(); // Cargar recetas
    };
    initializeAndFetch();
  }, []);

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

      setFavoriteRecipes(favoritesData); // Actualiza el estado con las recetas válidas
    } catch (error) {
      console.error("Error al cargar favoritos:", error);
      setError("No se pudieron cargar las recetas favoritas.");
    }
  };

  useEffect(() => {
    fetchFavoritesForUser();
  }, []);

  // Verificar si una receta ya está añadida
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
      setFavoriteRecipes((prevFavorites) =>
        prevFavorites.filter((recipe) => recipe.id !== favoriteRecipe.id)
      );

      Alert.alert("Éxito", `${favoriteRecipe.title} añadida a ${mealName}`);
    } catch (error) {
      Alert.alert("Error", "No se pudo añadir la receta");
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const getRecipesByCategory = async (category) => {
        const randomOffset = Math.floor(Math.random() * 450);
        const url = `https://api.spoonacular.com/recipes/complexSearch?type=${category}&number=2&offset=${randomOffset}&apiKey=${API_KEY}`;

        try {
          const response = await fetch(url);
          const data = await response.json();
          console.log(randomOffset);

          if (data.results) {
            console.log("Recetas encontradas:", data.results);

            const recetas = data.results;

            // Paso 3: Traduce los títulos de las recetas de inglés a español
            const translatedRecipes = await Promise.all(
              recetas.map(async (recipe) => {
                const translatedTitle = await translateText(
                  recipe.title,
                  "en",
                  "es"
                );
                return { ...recipe, title: translatedTitle };
              })
            );

            return translatedRecipes; // Devuelve las recetas
          } else {
            console.error("No se encontraron recetas.");
            return [];
          }
        } catch (error) {
          console.error("Error al obtener recetas:", error);
          return [];
        }
      };

      if (mealName === "Desayuno") {
        getRecipesByCategory("breakfast").then((recipes) => {
          setMealRecipes(recipes);
          console.log("Recetas obtenidas:", recipes);
        });
      } else if (mealName === "Almuerzo" || mealName === "Cena") {
        getRecipesByCategory("main course").then((recipes) => {
          setMealRecipes(recipes);
          console.log("Recetas obtenidas:", recipes);
        });
      }
    }, [mealName])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mealName}</Text>
      {favoriteRecipes.length === 0 ? (
        <Text style={styles.noFavoritesText}>
          No tienes recetas favoritas guardadas.
        </Text>
      ) : (
        <View>
          <Text style={styles.subtitle}>Recetas Favoritas:</Text>
          <View style={styles.recipeList}>
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
                    source={{
                      uri: item.image || "https://via.placeholder.com/80",
                    }}
                    style={styles.recipeImage}
                  />

                  <Text style={styles.recipeTitle}>{item.title}</Text>
                  {isRecipeAdded(item.id) ? (
                    // Ícono verde si la receta ya está añadida
                    <MaterialIcons
                      name="check-circle"
                      size={32}
                      color="green"
                    />
                  ) : (
                    // Ícono de añadir si no está añadida
                    <Pressable
                      style={styles.addIconButton}
                      onPress={() => handleAddFavoriteToMeal(item)}
                    >
                      <MaterialIcons
                        name="add-circle"
                        size={32}
                        color="#EF5B23"
                      />
                    </Pressable>
                  )}
                </Pressable>
              )}
              initialNumToRender={5}
              windowSize={10}
            />
          </View>
        </View>
      )}

      {mealRecipes.length === 0 ? (
        <Text style={styles.noFavoritesText}>No hay recetas disponibles.</Text>
      ) : (
        <View>
          <Text style={styles.subtitle}>Recetas para el {mealName}:</Text>
          <View>
            <FlatList
              data={mealRecipes}
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
                    source={{
                      uri: item.image || "https://via.placeholder.com/80",
                    }}
                    style={styles.recipeImage}
                  />
                  <Text style={styles.recipeTitle}>{item.title}</Text>

                  {isRecipeAdded(item.id) ? (
                    // Ícono verde si la receta ya está añadida
                    <MaterialIcons
                      name="check-circle"
                      size={32}
                      color="green"
                    />
                  ) : (
                    // Ícono de añadir si no está añadida
                    <Pressable
                      style={styles.addIconButton}
                      onPress={() => handleAddFavoriteToMeal(item)}
                    >
                      <MaterialIcons
                        name="add-circle"
                        size={32}
                        color="#EF5B23"
                      />
                    </Pressable>
                  )}
                </Pressable>
              )}
              initialNumToRender={5}
              windowSize={10}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FDF7F2" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#EF5B23",
  },
  recipeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeName: { flex: 1, fontSize: 16 },
  image: { width: 50, height: 50, borderRadius: 8, marginRight: 16 },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#EF5B23",
  },
  deleteButton: { marginLeft: 16 },
  deleteText: { color: "#EF5B23", fontWeight: "bold" },
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
  checkIcon: {
    marginLeft: 16,
    color: "green",
  },
  favoriteRecipeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    elevation: 3,
    padding: 10,
  },
  addIconButton: {
    marginLeft: 16,
  },
  recipeList: {
    maxHeight: 350,
    marginBottom: 16,
  },
});

export default AddRecet;
