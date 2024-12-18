import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { PieChart } from "react-native-chart-kit";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function DetalleIngrediente() {
  const route = useRoute();
  const { ingredienteId } = route.params; // Recibe el id del ingrediente como parámetro
  const navigation = useNavigation();
  const [ingredient, setIngredient] = useState(null);
  const [selectedNutrients, setSelectedNutrients] = useState([]);
  const [tableNutrients, setTableNutrients] = useState([]);

  const [finalValue, setFinalValue] = useState(0);

  const API_KEY = "8bd09a6a0ec64444b1240f14e038989d";
  const API_KEY_GOOGLE = "AIzaSyAauh--gJeN_HHVKY2mW_AF7b89JdQ2LOk";

  // Función para traducir texto usando Google Translate
  const translateText = async (text, sourceLang, targetLang) => {
    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${API_KEY_GOOGLE}&q=${text}&source=${sourceLang}&target=${targetLang}`
      );
      return response.data.data.translations[0].translatedText;
    } catch (error) {
      console.error("Error translating text:", error);
      return text; // Devuelve el texto original si hay un error
    }
  };

  useEffect(() => {
    const fetchIngredientDetails = async () => {
      try {
        const response = await axios.get(
          `https://api.spoonacular.com/food/ingredients/${ingredienteId}/information?apiKey=${API_KEY}&amount=1`
        );

        const ingrediente = response.data;

        const translatedRecipes = {
          ...ingrediente,
          name: await translateText(ingrediente.name, "en", "es"),
          aisle: await translateText(ingrediente.aisle, "en", "es"),
          original: await translateText(ingrediente.original, "en", "es"),
        };

        setIngredient(translatedRecipes);

        // Obtener calorías del ingrediente
        const calories =
          ingrediente.nutrition.nutrients.find(
            (nutriente) => nutriente.name === "Calories"
          )?.amount || 1;

        // Procesar todos los nutrientes y mantener la lógica original
        const nutrientesDeseados = [
          { name: "Vitamin C", factor: 10 },
          { name: "Fiber", factor: 8 },
          { name: "Protein", factor: 9 },
          { name: "Potassium", factor: 7 },
          { name: "Magnesium", factor: 6 },
          { name: "Calcium", factor: 7 },
          { name: "Vitamin B6", factor: 6 },
          { name: "Iron", factor: 5 },
          { name: "Vitamin B1", factor: 5 },
          { name: "Folate", factor: 4 },
          { name: "Vitamin B3", factor: 4 },
          { name: "Vitamin B5", factor: 4 },
          { name: "Vitamin B2", factor: 3 },
          { name: "Vitamin A", factor: 3 },
          { name: "Copper", factor: 3 },
          { name: "Zinc", factor: 3 },
          { name: "Phosphorus", factor: 2 },
          { name: "Vitamin K", factor: 2 },
          { name: "Manganese", factor: 2 },
          { name: "Selenium", factor: 1 },
          { name: "Vitamin E", factor: 1 },
          { name: "Sugar", factor: -5 },
          { name: "Saturated Fat", factor: -7 },
          { name: "Cholesterol", factor: -3 },
          { name: "Fat", factor: -2 },
        ];

        let valorTotal = 0;

        const nutrientesSeleccionados = ingrediente.nutrition.nutrients
          .filter((nutriente) =>
            nutrientesDeseados.some((n) => n.name === nutriente.name)
          )
          .map(async (nutriente) => {
            const factor =
              nutrientesDeseados.find((n) => n.name === nutriente.name)
                ?.factor || 1;

            // Traducir el nombre del nutriente a español
            const translatedName = await translateText(
              nutriente.name,
              "en",
              "es"
            );

            const valorCalculado = (nutriente.amount * factor) / calories;

            valorTotal += valorCalculado;

            return {
              name: translatedName, // Nombre traducido
              valorCalculado,
            };
          });

        // Esperar a que todas las traducciones se completen
        const nutrientesConTraducciones = await Promise.all(
          nutrientesSeleccionados
        );

        // Aplicar las condiciones finales para el resultado
        let finalResult = (valorTotal * 1000.0) / 1300.0;
        finalResult = Math.max(0, Math.min(finalResult, 1000.0));

        setSelectedNutrients(nutrientesConTraducciones);
        setFinalValue(finalResult);

        // Llamar a la nueva función para filtrar los nutrientes de la tabla
        filterTableNutrients(ingrediente);
      } catch (error) {
        console.error("Error fetching ingredient details:", error);
      }
    };

    const filterTableNutrients = async (ingrediente) => {
      const tableNutrientesDeseados = [
        "Vitamin C",
        "Fiber",
        "Protein",
        "Potassium",
        "Magnesium",
        "Calcium",
        "Vitamin B6",
        "Iron",
        "Sugar",
        "Saturated Fat",
        "Cholesterol",
      ];

      const nutrientesParaTabla = await Promise.all(
        ingrediente.nutrition.nutrients
          .filter((nutriente) =>
            tableNutrientesDeseados.includes(nutriente.name)
          )
          .map(async (nutriente) => {
            // Traducir el nombre del nutriente
            const translatedName = await translateText(
              nutriente.name,
              "en",
              "es"
            );

            return {
              name: translatedName, // Nombre traducido
              percentOfDailyNeeds: nutriente.percentOfDailyNeeds || 0,
            };
          })
      );

      setTableNutrients(nutrientesParaTabla);
    };

    fetchIngredientDetails();
  }, [ingredienteId]);

  // Función para obtener el mensaje basado en el valor ANDI
  const obtenerMensajeANDI = (valor) => {
    if (valor <= 10) {
      return "Muy baja densidad. Este ingrediente tiene muy pocos nutrientes en comparación con su contenido calórico. Úsalo con moderación.";
    } else if (valor <= 200) {
      return "Baja densidad. Este ingrediente aporta algunos nutrientes, es útil como complemento, pero debe combinarse con otros ingredientes más ricos en nutrientes.";
    } else if (valor <= 400) {
      return "Regular. Este ingrediente contiene una cantidad moderada de nutrientes, adecuado para una dieta balanceada.";
    } else if (valor <= 800) {
      return "Buena densidad. Este ingrediente es nutritivo y puede ser parte importante de una alimentación saludable.";
    } else {
      return "¡Excelente! Este ingrediente tiene una densidad de nutrientes excepcional y es una opción excelente para tu dieta.";
    }
  };

  // Obtener el mensaje correspondiente al valor ANDI
  const mensaje = obtenerMensajeANDI(finalValue.toFixed(0));

  const screenWidth = Dimensions.get("window").width;

  return (
    <View style={styles.container}>
      {ingredient ? (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Título */}
          <Text style={styles.title}>
            {ingredient.name} ( {ingredient.amount} gramo)
          </Text>

          {/* Tabla de información nutricional */}
          <View style={styles.table}>
            <View style={styles.tableRowHeader}>
              <Text style={styles.tableHeader}>Macronutriente</Text>
              <Text style={styles.tableHeader}>Porcentaje</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Proteínas</Text>
              <Text style={styles.tableCell}>
                {ingredient.nutrition?.caloricBreakdown?.percentProtein} %
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Grasas Totales</Text>
              <Text style={styles.tableCell}>
                {ingredient.nutrition?.caloricBreakdown?.percentFat} %
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Carbohidratos</Text>
              <Text style={styles.tableCell}>
                {ingredient.nutrition?.caloricBreakdown?.percentCarbs} %
              </Text>
            </View>
          </View>

          {/* Gráfica de pastel */}
          <Text style={styles.sectionTitle}>
            Distribución de Macronutrientes
          </Text>
          <PieChart
            data={[
              {
                name: "Proteínas",
                percentage:
                  ingredient.nutrition?.caloricBreakdown?.percentProtein || 0,
                color: "#FF6384",
                legendFontColor: "#7F7F7F",
                legendFontSize: 12,
              },
              {
                name: "Grasas Totales",
                percentage:
                  ingredient.nutrition?.caloricBreakdown?.percentFat || 0,
                color: "#36A2EB",
                legendFontColor: "#7F7F7F",
                legendFontSize: 12,
              },
              {
                name: "Carbohidratos",
                percentage:
                  ingredient.nutrition?.caloricBreakdown?.percentCarbs || 0,
                color: "#FFCE56",
                legendFontColor: "#7F7F7F",
                legendFontSize: 12,
              },
            ]}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              color: () => `rgba(255, 255, 255, 0.5)`,
            }}
            accessor={"percentage"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute // Muestra valores absolutos
          />

          <View
            style={{
              height: 2,
              backgroundColor: "#EF5B23",
              marginVertical: 10,
            }}
          />

          <View style={styles.container}>
            {/* Sección para mostrar el Valor ANDI */}
            <View style={styles.sectionValorAndi}>
              <Text style={styles.sectionTitle}>Valor ANDI:</Text>
              <View style={styles.containerAndi}>
                <Text style={styles.textAndi}>
                  {finalValue.toFixed(0)}
                  {/* Formatear a 0 decimales */}
                </Text>
                <Text style={styles.textAndi2}>/1000</Text>
              </View>
            </View>

            {/* Sección para mostrar la interpretación */}
            <View style={{ marginTop: 8 }}>
              <Text style={styles.sectionTitle}>Interpretación:</Text>
              <Text style={styles.interpretationText}>{mensaje}</Text>
              <Pressable onPress={() => navigation.navigate("InformacionAndi")}>
                <View style={styles.containerInfo}>
                  <Text style={styles.buttonTextRegister2}>
                    Más información
                  </Text>
                  <FontAwesome
                    name="info-circle"
                    size={18}
                    color="#EF5B23"
                    onPress={() => navigation.navigate("InformacionAndi")}
                  />
                </View>
              </Pressable>
            </View>
          </View>

          <View
            style={{
              height: 2,
              backgroundColor: "#EF5B23",
              marginVertical: 10,
            }}
          />

          {/* Descripción */}
          <Text style={styles.sectionTitle}>Curiosidades del ingrediente:</Text>
          <Text style={styles.text}>
            En el siguiente cuadro se muestra cuanto de un nutriente tiene un
            alimento en relación con lo que se debe consumir cada día.
          </Text>

          {/* Tabla de nutrientes */}
          <View style={styles.table}>
            <View style={styles.tableRowHeader}>
              <Text style={styles.tableHeader}>Nombre del nutriente</Text>
              <Text style={styles.tableHeader}>
                % Necesidades diarias cubierto
              </Text>
            </View>
            {tableNutrients.map((nutrient) => (
              <View style={styles.tableRow} key={nutrient.name}>
                <Text style={styles.tableCell}>{nutrient.name}</Text>
                <Text style={styles.tableCell}>
                  {nutrient.percentOfDailyNeeds.toFixed(2)} %
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <Text style={styles.loadingText}>
          Cargando detalles del ingrediente...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEF6F0",
  },
  buttonTextRegister2: {
    color: "#EF5B23",
    fontWeight: "bold",
  },
  containerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EF5B23",
    textAlign: "center",
    marginBottom: 20,
  },
  table: {
    borderWidth: 1,
    borderColor: "#EF5B23",
    marginBottom: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  tableRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EF5B23",
    backgroundColor: "#ef5b23",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EF5B23",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableHeader: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 16,
    width: "50%",
    paddingStart: 20,
  },
  tableCell: {
    fontSize: 14,
    color: "black",
    marginEnd: 30,
    marginStart: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EF5B23",
    marginTop: 10,
  },
  sectionValorAndi: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  containerAndi: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    marginEnd: 10,
  },
  text: {
    fontSize: 16,
    color: "black",
    marginBottom: 10,
  },
  textAndi: {
    fontSize: 30,
    marginEnd: 10,
    fontWeight: "bold",
  },
  textAndi2: {
    fontSize: 20,
    marginLeft: 8,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  interpretationText: {
    fontSize: 16,
    marginTop: 4,
  },
});
