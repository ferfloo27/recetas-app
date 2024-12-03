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
import { doc, setDoc, collection } from "firebase/firestore"; // Importamos Firestore
import { auth, db } from "../../firebase-config"; // Importamos configuración de Firebase
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleCreateAccount = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor, complete todos los campos.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      // Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Crear el documento del usuario en Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        email: email,
        createdAt: new Date(),
      });

      // Crear la subcolección `dailyMenu` con un documento inicial
      const dailyMenuRef = collection(db, "users", user.uid, "dailyMenu");
      /*await setDoc(doc(dailyMenuRef, new Date().toISOString()), {
        fecha: new Date().toISOString(),
        comidas: {
          desayuno: [],
          almuerzo: [],
          cena: [],
        },
      });*/

      Alert.alert("Cuenta creada", `¡Bienvenido, ${user.email}!`);
      console.log("Cuenta creada con el correo:", user.email);
    } catch (error) {
      console.log("Error al crear la cuenta:", error.message);
      handleAuthError(error.code);
    }
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
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }], // Reinicia la pila con Home como la única pantalla
        });
      })
      .catch((error) => {
        console.log("Error al iniciar sesión:", error.message);
        handleAuthError(error.code);
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
      <Text style={styles.subtitle}>
        Ingresa tus credenciales para iniciar sesión.
      </Text>
      <Text style={styles.label}>Correo electrónico: </Text>
      <View style={styles.inputContainer}>
        <FontAwesome
          name="envelope"
          size={24}
          color="#A1A1AA"
          style={styles.icon}
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="nombre@ejemplo.com"
          keyboardType="email-address"
        />
      </View>
      <Text style={styles.label}>Contraseña: </Text>
      <View style={styles.inputContainer}>
        <FontAwesome
          name="lock"
          size={24}
          color="#A1A1AA"
          style={styles.icon}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholder="......"
          secureTextEntry
        />
      </View>

      <Pressable
        onPress={handleLogin}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed, // Cambia el estilo cuando está presionado
        ]}
      >
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
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderRadius: 5,
    padding: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#FF931E",
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  icon: {
    marginRight: 10,
    width: 24,
    height: 24,
  },
});

export default Login;
