import React from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import BottomNav from "../components/BottomNav";
import { useNavigation } from "@react-navigation/native";
import { useMenuViewModel } from "../viewModels/MenuViewModel";

const Menu = () => {
  const navigation = useNavigation();
  const { meals, nutrientTotals } = useMenuViewModel();

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
    return `${date.getDate()} de ${months[date.getMonth()]}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Diario</Text>
        <Text style={styles.date}>{`< ${getFormattedDateMenu()} >`}</Text>
        <View style={styles.nutritionSummary}>
          {["carbohydrates", "protein", "fat"].map((key, index) => (
            <View key={index} style={styles.nutrientBox}>
              <Text style={styles.nutrientValue}>
                {nutrientTotals[key].toFixed(2)} gr
              </Text>
              <Text style={styles.nutrientName}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      </View>

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
              onPress={() =>
                navigation.navigate("MealDetail", { mealName: item.name })
              }
              style={styles.addButton}
            >
              <MaterialIcons name="add" size={24} color="#fff" />
            </Pressable>
          </View>
        )}
      />

      <BottomNav
        style={styles.bottomNav}
        navigation={navigation}
        activeScreen="MenuScreen"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { alignItems: "center", padding: 16, backgroundColor: "#FFF4F0" },
  title: { fontSize: 24, fontWeight: "bold", color: "#EF5B23" },
  date: { fontSize: 16, marginVertical: 8, color: "#333" },
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

export default Menu;
