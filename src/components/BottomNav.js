// components/BottomNav.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function BottomNav({ navigation, activeScreen }) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Home")}
      >
        <FontAwesome
          name="home"
          size={28}
          color={activeScreen === "Home" ? "#EF5B23" : "#FFFF"}
        />
        <Text style={styles.navText}>Inicio</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Favoritos")}
      >
        <FontAwesome
          name="heart"
          size={24}
          color={activeScreen === "Favoritos" ? "#EF5B23" : "#FFFF"}
        />
        <Text style={styles.navText}>Favoritos</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("MenuScreen")}
      >
        <FontAwesome
          name="book"
          size={24}
          color={activeScreen === "MenuScreen" ? "#EF5B23" : "#FFFF"}
        />
        <Text style={styles.navText}>Menú</Text>
      </TouchableOpacity>
      {/*<TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("CategoriesScreen")}
      >
        <FontAwesome name="cutlery" size={24} color="#FFFF" />
        <Text style={styles.navText}>Categorías</Text>
      </TouchableOpacity>*/}

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("ProfileView")}
      >
        <FontAwesome
          name="user"
          size={24}
          color={activeScreen === "ProfileView" ? "#EF5B23" : "#FFFF"}
        />
        <Text style={styles.navText}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#C9C7D0",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#E1E1E1",

    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#FFFF",
  },
});
