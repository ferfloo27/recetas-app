import { StatusBar } from "expo-status-bar";
import { Pressable, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { FontAwesome } from "@expo/vector-icons";
import DetalleView from "./src/components/DetalleView";
import Buscador from "./src/components/Buscador";
import Home from "./src/components/Home";
import Login from "./src/components/Login";
import Favoritos from "./src/components/Favoritos";
import MenuScreen from "./src/components/MenuScreen";
import MealDetail from "./src/components/MealDetail";
import DetalleIngrediente from "./src/components/DetalleIngrediente";
import ProfileView from "./src/components/ProfileView";
import AddRecet from "./src/components/AddRecet";
const Stack = createStackNavigator();
import Register from "./src/components/Register";
import BuscadorPorCategoria from "./src/components/BuscadorPorCategoria";
import InformacionAndi from "./src/components/InformacionAndi";

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#EF5B23" />
      <Stack.Navigator initialRouteName="Login">
        {/* Pantalla de Login */}
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            title: "Login",
            headerStyle: { backgroundColor: "#FF931E" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            gestureEnabled: false,
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Register"
          component={Register}
          options={{
            title: "Register",
            headerStyle: { backgroundColor: "#FF931E" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            gestureEnabled: false,
            headerShown: false,
          }}
        />

        {/* Pantalla de Buscador */}
        <Stack.Screen
          name="Buscador"
          component={Buscador}
          options={{
            title: "Buscador",
            headerStyle: { backgroundColor: "#FF931E" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            headerTitleAlign: "center", // Centra el título del header
          }}
        />

        <Stack.Screen
          name="BuscadorPorCategoria"
          component={BuscadorPorCategoria}
          options={{
            title: "Buscador",
            headerStyle: { backgroundColor: "#FF931E" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            headerTitleAlign: "center", // Centra el título del header
          }}
        />
        {/* Pantalla de Detalle de la Receta */}
        <Stack.Screen
          name="Detalle de la Receta"
          component={DetalleView}
          options={{
            title: "Detalle de la Receta",
            headerStyle: { backgroundColor: "#FF931E" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />
        <Stack.Screen
          name="Detalle del ingrediente"
          component={DetalleIngrediente}
          options={{
            title: "Detalle del ingrediente",
            headerStyle: { backgroundColor: "#FF931E" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />

        <Stack.Screen
          name="Home"
          component={Home}
          options={({ navigation }) => ({
            title: "Inicio",
            headerStyle: { backgroundColor: "#FF931E" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            headerTitleAlign: "center", // Centra el título del header
            headerLeft: () => null, // Esto oculta el botón de retroceso
            headerRight: () => (
              <Pressable
                onPress={() => navigation.navigate("Buscador")} // Usamos navigation aquí
                style={styles.headerButton}
              >
                <FontAwesome name="search" size={24} color="#fff" />
              </Pressable>
            ),
          })}
        />
        <Stack.Screen
          name="Favoritos"
          component={Favoritos}
          options={({ navigation }) => ({
            title: "Favoritos",
            headerStyle: { backgroundColor: "#FF931E" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            headerTitleAlign: "center", // Centra el título del header
            headerLeft: () => null, // Esto oculta el botón de retroceso
            headerRight: () => (
              <Pressable
                onPress={() => navigation.navigate("Buscador")} // Usamos navigation aquí
                style={styles.headerButton}
              >
                <FontAwesome name="search" size={24} color="#fff" />
              </Pressable>
            ),
          })}
        />

        <Stack.Screen
          name="MenuScreen"
          component={MenuScreen}
          options={{
            title: "Menu",
            headerStyle: { backgroundColor: "#FF931E" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />

        <Stack.Screen
          name="AddRecet"
          component={AddRecet}
          options={({ navigation }) => ({
            title: "Agregar Recetas",
            headerStyle: { backgroundColor: "#FF931E" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
          })}
        />

        <Stack.Screen
          name="MealDetail"
          component={MealDetail}
          options={{
            title: "Detalle del Menu",
            headerStyle: { backgroundColor: "#FF931E" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />

        <Stack.Screen
          name="InformacionAndi"
          component={InformacionAndi}
          options={{
            title: "Valores ANDI",
            headerStyle: { backgroundColor: "#FF931E" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />
        <Stack.Screen
          name="ProfileView"
          component={ProfileView}
          options={{
            title: "Perfil",
            headerStyle: { backgroundColor: "#FF931E" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    marginTop: 50,
    justifyContent: "center",
  },

  headerButton: {
    marginRight: 10,
    padding: 8,
  },
});
