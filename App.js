import { StatusBar } from 'expo-status-bar';
import { Pressable, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
import DetalleView from './src/components/DetalleView';
import Buscador from './src/components/Buscador';
import Home from './src/components/Home';
import Favoritos from './src/components/Favoritos';
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#EF5B23" />
      <Stack.Navigator initialRouteName="Home">
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
          name="Home" 
          component={Home} 
          options={({ navigation }) => ({
            title: "Inicio",
            headerStyle: { backgroundColor: "#FF931E" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            headerTitleAlign: "center", // Centra el título del header
            headerLeft: () => null,  // Esto oculta el botón de retroceso
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
            headerLeft: () => null,  // Esto oculta el botón de retroceso
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop: 50,
    justifyContent: 'center',
  },

  headerButton: {
    marginRight: 10,
    padding: 8,
  },
});
