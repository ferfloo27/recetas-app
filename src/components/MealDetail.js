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

const MealDetail = ({ route }) => {
  const navigation = useNavigation();
  const { mealName } = route.params; // Tipo de comida: "Desayuno", "Almuerzo", etc.
  const [recipes, setRecipes] = useState([]);
  const userId = auth.currentUser?.uid; // ID del usuario logueado
  const date = getFormattedDate(); // Fecha actual formateada dinámicamente

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

  // Añadir una nueva receta
  const addRecipe = () => {
    navigation.navigate("AddRecet", { mealName });
  };

  const fetchMealRecipes = async () => {
    if (!userId) return;

    const mealDocRef = doc(
      collection(db, `users/${userId}/dailyMenu/${date}/comidas`),
      mealName
    );

    try {
      const snapshot = await getDoc(mealDocRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setRecipes(data.recetas || []);
      } else {
        setRecipes([]);
      }
    } catch (error) {
      console.error("Error al cargar las recetas de la comida:", error);
    }
  };

  useEffect(() => {
    fetchMealRecipes();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchMealRecipes(); // Refrescar al volver a esta vista
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mealName}</Text>

      {recipes.length === 0 ? (
        <Text style={styles.noRecipesText}>No hay recetas añadidas aún.</Text>
      ) : (
        <FlatList
          data={recipes}
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
                source={{ uri: item.imageUrl }}
                style={styles.recipeImage}
              />
              <Text style={styles.recipeTitle}>{item.recipeName}</Text>
            </Pressable>
          )}
        />
      )}

      <Pressable style={styles.addButton} onPress={addRecipe}>
        <Text style={styles.addButtonText}> + </Text>
      </Pressable>
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
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#ff5c5c",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 40 },
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

export default MealDetail;
