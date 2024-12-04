import React, { useState, useEffect } from "react";
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
import { MaterialIcons } from "@expo/vector-icons"; // Importa el ícono de Ionicons
import { useNavigation } from "@react-navigation/native";

// Función para generar la fecha en formato dinámico "YYYY-MM-DD"
const getFormattedDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Mes en formato 2 dígitos
  const day = String(today.getDate()).padStart(2, "0"); // Día en formato 2 dígitos
  return `${year}-${month}-${day}`;
};

const AddRecet = ({ route }) => {
  const navigation = useNavigation();
  const { mealName } = route.params; // Tipo de comida: "Desayuno", "Almuerzo", etc.
  const [recipes, setRecipes] = useState([]);
  const userId = auth.currentUser?.uid; // ID del usuario logueado
  const date = getFormattedDate(); // Fecha actual formateada dinámicamente

  const [favoriteRecipes, setFavoriteRecipes] = useState([]); // Estado para las recetas favoritas
  const [error, setError] = useState(null);

  if (!userId) {
    Alert.alert("Error", "No se pudo obtener el usuario logueado");
    return null;
  }

  // Referencia al documento del tipo de comida
  const comidasRef = collection(
    db,
    `users/${userId}/dailyMenu/${date}/comidas`
  );
  const mealDocRef = doc(comidasRef, mealName); // Documento específico del mealType

  // Inicializar el documento del tipo de comida si no existe
  const initializeMealDoc = async () => {
    try {
      const snapshot = await getDoc(mealDocRef);
      if (!snapshot.exists()) {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mealName}</Text>
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
          initialNumToRender={5}
          windowSize={10}
        />
      )}
      {
        // Listado de recetas
        /*<FlatList
        data={recipes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.recipeCard}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <Text style={styles.recipeName}>{item.recipeName}</Text>
            <Pressable
              style={styles.deleteButton}
              onPress={() => deleteRecipe(index)}
            >
              <Text style={styles.deleteText}>Eliminar</Text>
            </Pressable>
          </View>
        )}
      />*/
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FDF7F2" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
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
});

export default AddRecet;
