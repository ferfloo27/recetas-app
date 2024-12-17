import React from "react";
import { View, Text, StyleSheet, Alert, Pressable } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import BottomNav from "../components/BottomNav";
import { useProfileViewModel } from "../viewModels/ProfileViewModel";

const ProfileView = () => {
  const navigation = useNavigation();
  const { user, handleLogout } = useProfileViewModel(navigation);

  const confirmLogout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        onPress: async () => {
          try {
            await handleLogout();
            Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente.");
          } catch (error) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerProfile}>
        <FontAwesome name="user-circle" size={100} color="#FF931E" />
        <Text style={styles.title}>Perfil del Usuario</Text>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.button}>
          <Pressable onPress={confirmLogout}>
            <Text style={styles.buttonText}>Cerrar sesión</Text>
          </Pressable>
        </View>
      </View>
      <BottomNav
        style={styles.bottomNav}
        navigation={navigation}
        activeScreen="ProfileView"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  containerProfile: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
    width: "80%",
    marginVertical: 100,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 20,
  },
  label: {
    fontSize: 20,
    color: "black",
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  email: {
    fontSize: 16,
    color: "#333",
    marginBottom: 40,
    alignSelf: "flex-start",
  },
  button: {
    backgroundColor: "#ff5c5c",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ProfileView;
