import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, Image, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

const Buscador = () => {
  const [query, setQuery] = useState('');
  const [recetas, setRecetas] = useState([]);
  const [recetasPorIngredientes, setRecetasPorIngredientes] = useState([]);
  const [recetasPorAlgunosIngredientes, setRecetasPorAlgunosIngredientes] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([]);
  const [activeView, setActiveView] = useState('recetas');
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const API_KEY_GOOGLE="AIzaSyAauh--gJeN_HHVKY2mW_AF7b89JdQ2LOk";
  const API_KEY = "8bd09a6a0ec64444b1240f14e038989d";

  // Función para traducir texto usando Google Translate
const translateText = async (text, sourceLang, targetLang) => {
  try {
    const response = await axios.post(`https://translation.googleapis.com/language/translate/v2?key=${API_KEY_GOOGLE}&q=${text}&source=${sourceLang}&target=${targetLang}`);
    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error("Error translating text:", error);
    return text; // Devuelve el texto original si hay un error
  }
};

 // Función para traducir nombres de ingredientes seleccionados
 const translateSelectedIngredients = async () => {
  try {
    // Traducir cada nombre de ingrediente al inglés
    const translatedIngredients = await Promise.all(
      ingredientesSeleccionados.map(async (ingredient) => {
        const translatedName = await translateText(ingredient.name, 'es', 'en');
        return { ...ingredient, name: translatedName };
      })
    );
    return translatedIngredients;
  } catch (error) {
    console.error('Error translating selected ingredients:', error);
    return ingredientesSeleccionados; // Retorna los ingredientes originales si hay un error
  }
};

  const searchRecetas = async (searchQuery) => {
    try {

      const traslatedQuery = await translateText(searchQuery, 'es', 'en');
      const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${traslatedQuery}&number=20`);
      
      const recetas = response.data.results;

    // Paso 3: Traduce los títulos de las recetas de inglés a español
    const translatedRecipes = await Promise.all(
      recetas.map(async (recipe) => {
        const translatedTitle = await translateText(recipe.title, 'en', 'es');
        return { ...recipe, title: translatedTitle };
      })
    );

      setRecetas(translatedRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const searchIngredients = async (searchQuery) => {
    try {
      const traslatedQuery = await translateText(searchQuery, 'es', 'en');
      const response = await axios.get(`https://api.spoonacular.com/food/ingredients/search?apiKey=${API_KEY}&query=${traslatedQuery}&number=10&sortDirection=desc`);
      

      const ingredientes = response.data.results;
      
    // Paso 3: Traduce los títulos de las recetas de inglés a español
    const translatedRecipes = await Promise.all(
      ingredientes.map(async (recipe) => {
        console.log(recipe.name);
        const translatedTitle = await translateText(recipe.name, 'en', 'es');
        return { ...recipe, name: translatedTitle };
      })
    );

      setIngredientes(translatedRecipes);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

// busqueda segun ingredientes 
  const searchRecetasPorIngredientes = async () => {
    try {
      const translatedIngredients = await translateSelectedIngredients();
      const ingredientesQuery = translatedIngredients.map(ingredient => ingredient.name).join(',');
      const response = await axios.get(
        `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${API_KEY}&ingredients=${ingredientesQuery}&ranking=2&number=2`
      );

      const ingredientes = response.data;
      
    // Paso 3: Traduce los títulos de las recetas de inglés a español
    const translatedRecipes = await Promise.all(
      ingredientes.map(async (recipe) => {
        
        const translatedTitle = await translateText(recipe.title, 'en', 'es');
        return { ...recipe, title: translatedTitle };
      })
    );
      setRecetasPorIngredientes(translatedRecipes);
    } catch (error) {
      console.error('Error fetching recipes by ingredients:', error);
    }
  };

  // busqueda segun ingredientes 
  const searchRecetasPorAlgunosIngredientes = async () => {
    try {
      const translatedIngredients = await translateSelectedIngredients();
      const ingredientesQuery = translatedIngredients.map(ingredient => ingredient.name).join(',');
      const response = await axios.get(
        `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${API_KEY}&ingredients=${ingredientesQuery}&ranking=1&number=2`
      );
      const ingredientes = response.data;
      
    // Paso 3: Traduce los títulos de las recetas de inglés a español
    const translatedRecipes = await Promise.all(
      ingredientes.map(async (recipe) => {
        
        const translatedTitle = await translateText(recipe.title, 'en', 'es');
        return { ...recipe, title: translatedTitle };
      })
    );

      setRecetasPorAlgunosIngredientes(translatedRecipes);

    } catch (error) {
      console.error('Error fetching recipes by ingredients:', error);
    }
  };
  

  // Maneja la búsqueda de recetas o ingredientes
  const handleSearch = (text) => {
    setQuery(text);
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const newTimeout = setTimeout(() => {
      if (activeView === 'recetas') {
        searchRecetas(text);
      } else {
        searchIngredients(text);
      }
    }, 500);
    setDebounceTimeout(newTimeout);
  };

  const handleIngredientSelect = (ingredient) => {
    if (!ingredientesSeleccionados.some((item) => item.id === ingredient.id)) {
      setIngredientesSeleccionados([...ingredientesSeleccionados, ingredient]);
    }
    setIngredientes([]); // Limpiar la lista de ingredientes
    setQuery(''); // Limpiar el campo de búsqueda
    searchRecetasPorIngredientes();
    searchRecetasPorAlgunosIngredientes();
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <FontAwesome name="arrow-left" size={24} />
        <TextInput
          style={styles.input}
          placeholder="Buscar receta o ingrediente..."
          placeholderTextColor="#C9C7D0"
          value={query}
          onChangeText={handleSearch}
        />
        <FontAwesome name="search" size={24} color="#C9C7D0" style={styles.iconoSearch} />
        <FontAwesome name="filter" size={24} />
        
      </View>

      {activeView === 'ingredientes' && ingredientes.length > 0 && (
        <View
        style={styles.listaDesplegable}>
          <FlatList
          data={ingredientes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleIngredientSelect(item)} style={styles.ingredientItem}>
              <Text style={styles.ingredientText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
        </View>
      )}


      <View style={styles.btns}>
        <Pressable
          style={[styles.btnOptions, activeView === 'recetas' && styles.activeBtn]}
          onPress={() => setActiveView('recetas')}
        >
          <Text style={activeView === 'recetas' ? styles.activeText : styles.inactiveText}>Recetas</Text>
        </Pressable>
        <Pressable
          style={[styles.btnOptions, activeView === 'ingredientes' && styles.activeBtn]}
          onPress={() => setActiveView('ingredientes')}
        >
          <Text style={activeView === 'ingredientes' ? styles.activeText : styles.inactiveText}>Ingredientes</Text>
        </Pressable>
      </View>

      
      {activeView === 'recetas' ? (
        <FlatList
          contentContainerStyle={styles.listElements}
          data={recetas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.recipeItem}>
              <Image source={{ uri: item.image }} style={styles.recipeImage} />
              <Text style={styles.recipeTitle}>{item.title}</Text>
            </View>
          )}
        />
      ) : (
        <View>
          <Text style={styles.titulo}>Ingredientes seleccionados</Text>
          {ingredientesSeleccionados.length > 0 ? (
            <FlatList
              contentContainerStyle={styles.listIngredients}
              data={ingredientesSeleccionados}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.selectedIngredientItem}>
                  <Text style={styles.ingredientText}>{item.name}</Text>
                  <FontAwesome name="close" size={20} onPress={() => handleIngredientSelect(item)} />
                </View>
              )}
            />
            
          ) : (
            <Text style={styles.subtitulo}>No hay ningún ingrediente seleccionado</Text>
          )}
          <Text style={styles.titulo}>Recetas que incluyen todos los ingredientes</Text>
          {ingredientesSeleccionados.length > 0 ? (
             <FlatList
             contentContainerStyle={styles.listElements}
             data={recetasPorIngredientes}
             keyExtractor={(item) => item.id.toString()}
             renderItem={({ item }) => (
               <View style={styles.recipeItem}>
                 <Image source={{ uri: item.image }} style={styles.recipeImage} />
                 <Text style={styles.recipeTitle}>{item.title}</Text>
               </View>
             )}
           />
            
          ) : (
            <Text style={styles.subtitulo}>No hay ningún ingrediente seleccionado</Text>
          )}

<Text style={styles.titulo}>Recetas con al menos un ingrediente</Text>
          {ingredientesSeleccionados.length > 0 ? (
            <FlatList
            contentContainerStyle={styles.listElements}
            data={recetasPorAlgunosIngredientes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.recipeItem}>
                <Image source={{ uri: item.image }} style={styles.recipeImage} />
                <Text style={styles.recipeTitle}>{item.title}</Text>
              </View>
            )}
          />
            
          ) : (
            <Text style={styles.subtitulo}>No hay ningún ingrediente seleccionado</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
    height: '100%',
  },
  input: {
    borderWidth: 1,
    padding: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '82%',
    borderColor: '#C9C7D0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 15,
  },
  iconoSearch: {
    position: 'absolute',
    right: 50,
    top: 10,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 355,
    height: 51,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#E6E6E6',
  },
  recipeImage: {
    width: 100,
    height: 50,
    marginRight: 10,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    resizeMode: 'stretch',
  },
  recipeTitle: {
    fontSize: 16,
    flexShrink: 1,
    paddingEnd: 5,
  },
  listElements: {
    width: '100%',
    marginTop: 20,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  btns: {
    width: '100%',
    padding: 10,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#C9C7D0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20
  },
  btnOptions: {
    width: '45%',
    padding: 5,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#C9C7D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBtn: {
    backgroundColor: '#FFFEFE',
  },
  activeText: {
    color: 'black',
  },
  inactiveText: {
    color: 'white',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    color: '#EF5B23',
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ingredientItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  ingredientText: {
    fontSize: 16,
  },
  selectedIngredientItem: {
    padding: 8,
    backgroundColor: '#FFFEFE',
    elevation: 7,
    borderRadius: 20,
    marginVertical: 5,
    marginLeft: 10,
    width:100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  listIngredients: {
    flexDirection: 'row'
  },
  listaDesplegable: {
    position: 'absolute',
    width: '81.5%',
    top: 60, // Ajusta según la posición del input
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    maxHeight: 200,
    zIndex: 1,
    marginLeft: 48
  }
});

export default Buscador;
