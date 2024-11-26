import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebase-config";
import { useNavigation } from "@react-navigation/native";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleCreateAccount = () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor, complete todos los campos.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Cuenta creada con el correo:", user.email);
        Alert.alert("Cuenta creada", `¡Bienvenido, ${user.email}!`);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("Error al crear la cuenta:", errorMessage);
        handleAuthError(errorCode);
      });
  };

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor, complete todos los campos.");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Sesión iniciada con el correo:", user.email);
        Alert.alert("Inicio de sesión", `¡Bienvenido, ${user.email}!`);
        navigation.navigate("Home");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("Error al iniciar sesión:", errorMessage);
        handleAuthError(errorCode);
      });
  };

  const handleAuthError = (errorCode) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        Alert.alert("Error", "Este correo ya está en uso.");
        break;
      case "auth/invalid-email":
        Alert.alert("Error", "El correo no es válido.");
        break;
      case "auth/weak-password":
        Alert.alert("Error", "La contraseña es demasiado débil.");
        break;
      case "auth/wrong-password":
        Alert.alert("Error", "La contraseña es incorrecta.");
        break;
      case "auth/user-not-found":
        Alert.alert("Error", "Usuario no encontrado.");
        break;
      case "auth/admin-restricted-operation":
        Alert.alert(
          "Error",
          "No tienes permiso para realizar esta operación. Contacta al administrador."
        );
        break;
      default:
        Alert.alert("Error", "Ha ocurrido un error. Intente nuevamente.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inicio de Sesión</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
      />
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleCreateAccount}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#FF931E",
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

export default Login;
