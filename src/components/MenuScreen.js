import React from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import BottomNav from "./BottomNav";
import { useNavigation } from "@react-navigation/native";

const MenuScreen = () => {
  const navigation = useNavigation();

  // Datos simulados para las comidas
  const meals = [
    { id: "1", name: "Desayuno" },
    { id: "2", name: "Almuerzo" },
    { id: "3", name: "Cena" },
  ];

  return (
    <View style={styles.container}>
      {/* Cabecera con el título y fecha */}
      <View style={styles.header}>
        <Text style={styles.title}>Diario</Text>
        <Text style={styles.date}>{"< 6 de Octubre >"}</Text>
        <View style={styles.nutritionSummary}>
          <View style={styles.nutrientBox}>
            <Text style={styles.nutrientValue}>0 gr</Text>
            <Text style={styles.nutrientName}>Carbo</Text>
          </View>
          <View style={styles.nutrientBox}>
            <Text style={styles.nutrientValue}>0 gr</Text>
            <Text style={styles.nutrientName}>Proteínas</Text>
          </View>
          <View style={styles.nutrientBox}>
            <Text style={styles.nutrientValue}>0 gr</Text>
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
              <Text style={styles.addFoodText}>Añade comida</Text>
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
