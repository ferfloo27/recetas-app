import React, { useContext } from "react";
import { View, Text, StyleSheet, Button, Alert, Pressable } from "react-native";
import { getAuth, signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
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
      <FontAwesome name="user-circle" size={100} color="#FF931E" />
      <Text style={styles.title}>Perfil del Usuario</Text>
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.email}>{user?.email || "No disponible"}</Text>
      <View style={styles.button}>
        <Pressable title="Cerrar sesión" onPress={handleLogout}>
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  buttonPressed: {
    backgroundColor: "#3700B3", // Cambia a un color más oscuro al presionarlo
    transform: [{ scale: 0.95 }], // Reduce ligeramente el tamaño
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ProfileView;
