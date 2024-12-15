import React from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import BottomNav from "./BottomNav";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../../firebase-config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { parse } from "react-native-svg";

// Función para generar la fecha en formato dinámico "YYYY-MM-DD"
const getFormattedDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Mes en formato 2 dígitos
  const day = String(today.getDate()).padStart(2, "0"); // Día en formato 2 dígitos
  return `${year}-${month}-${day}`;
};

const MenuScreen = () => {
  const navigation = useNavigation();

  const userId = auth.currentUser?.uid;
  const date = getFormattedDate();

  // Datos simulados para las comidas
  const meals = [
    { id: "1", name: "Desayuno", periodo: "06:00 AM a 09:00 AM" },
    { id: "2", name: "Colacion", periodo: "10:00 AM a 12:00 AM" },
    { id: "3", name: "Almuerzo", periodo: "12:00 AM a 02:00 PM" },
    { id: "4", name: "Merienda", periodo: "04:00 PM a 06:00 PM" },
    { id: "5", name: "Cena", periodo: "07:00 PM a 09:00 PM" },
    { id: "6", name: "Postre", periodo: "despues de la cena o almuerzo" },
  ];

  const getFormattedDateMenu = () => {
    const date = new Date();
    const months = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    return `${day} de ${month}`;
  };

  const dailyMenuRefNutrients = doc(db, `users/${userId}/dailyMenu/${date}`);

  const [nutrientTotals, setNutrientTotals] = useState({
    carbohydrates: 0,
    protein: 0,
    fat: 0,
  });

  useFocusEffect(
    useCallback(() => {
      const fetchNutrients = async () => {
        try {
          const snapshot = await getDoc(dailyMenuRefNutrients);
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.nutrientes) {
              setNutrientTotals(data.nutrientes);
            }
          } else {
            console.log("No se encontró el documento");
          }
        } catch (error) {
          console.error("Error al obtener los nutrientes:", error);
        }
      };

      fetchNutrients();
    }, []) // Sin dependencias, se ejecutará cada vez que la pantalla esté activa
  );

  return (
    <View style={styles.container}>
      {/* Cabecera con el título y fecha */}
      <View style={styles.header}>
        <Text style={styles.title}>Diario</Text>
        <Text style={styles.date}>{`< ${getFormattedDateMenu()} >`}</Text>
        <View style={styles.nutritionSummary}>
          <View style={styles.nutrientBox}>
            <Text style={styles.nutrientValue}>
              {parseFloat(nutrientTotals.carbohydrates).toFixed(2)} gr
            </Text>
            <Text style={styles.nutrientName}>Carbo</Text>
          </View>
          <View style={styles.nutrientBox}>
            <Text style={styles.nutrientValue}>
              {parseFloat(nutrientTotals.protein).toFixed(2)} gr
            </Text>
            <Text style={styles.nutrientName}>Proteínas</Text>
          </View>
          <View style={styles.nutrientBox}>
            <Text style={styles.nutrientValue}>
              {parseFloat(nutrientTotals.fat).toFixed(2)} gr
            </Text>
            <Text style={styles.nutrientName}>Grasas</Text>
          </View>
        </View>
      </View>

      {/* Lista de comidas */}
      <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.mealItem}>
            <MaterialIcons name="restaurant" size={24} color="#EF5B23" />
            <View style={styles.mealDetails}>
              <Text style={styles.mealName}>{item.name}</Text>
              <Text style={styles.addFoodText}>{item.periodo}</Text>
            </View>
            <Pressable
              onPress={() => {
                navigation.navigate("MealDetail", { mealName: item.name });
              }}
              style={styles.addButton}
            >
              <MaterialIcons name="add" size={24} color="#fff" />
            </Pressable>
          </View>
        )}
      />

      {/* Barra de navegación */}
      <BottomNav
        style={styles.bottomNav}
        navigation={navigation}
        activeScreen="MenuScreen"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF4F0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EF5B23",
  },
  date: {
    fontSize: 16,
    color: "#333",
    marginVertical: 8,
  },
  nutritionSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 16,
    borderWidth: 2,
    borderColor: "#Ef5b23",
    paddingVertical: 12,
    borderRadius: 10,
  },
  nutrientBox: {
    alignItems: "center",
  },
  nutrientValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  nutrientName: {
    fontSize: 14,
    color: "#666",
  },
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  mealDetails: {
    flex: 1,
    marginLeft: 12,
  },
  mealName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addFoodText: {
    fontSize: 14,
    color: "#999",
  },
  addButton: {
    backgroundColor: "#EF5B23",
    borderRadius: 8,
    padding: 8,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default MenuScreen;
