import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Buscador from './src/components/Buscador';

export default function App() {
  return (
    <View style={styles.container}>
      
      <Buscador/>
    </View>
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
});
