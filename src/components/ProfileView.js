import React, { useContext } from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import { getAuth, signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
// Ajusta la ruta según tu estructura

const ProfileView = () => {
  const navigation = useNavigation();

  const auth = getAuth();
  const user = auth.currentUser;
  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        onPress: () => {
          signOut(auth)
            .then(() => {
              Alert.alert(
                "Sesión cerrada",
                "Has cerrado sesión correctamente."
              );

              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }], // La pila se reinicia en la pantalla de Login
              });
            })
            .catch((error) => {
              Alert.alert("Error", "Ocurrió un error al cerrar sesión.");
              console.error(error);
            });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil del Usuario</Text>
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.email}>{user?.email || "No disponible"}</Text>
      <Button title="Cerrar sesión" onPress={handleLogout} color="#ff5c5c" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: "#555",
  },
  email: {
    fontSize: 16,
    color: "#333",
    marginBottom: 40,
  },
});

export default ProfileView;
