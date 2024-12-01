import React, { useState, useEffect } from "react";
import axios from "axios";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { useRoute } from "@react-navigation/native";
import { PieChart } from "react-native-chart-kit";

export default function DetalleIngrediente() {
  const route = useRoute();
  const { ingredienteId } = route.params; // Recibe el id del ingrediente como parámetro
  const [ingredient, setIngredient] = useState(null);

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
      } catch (error) {
        console.error("Error fetching ingredient details:", error);
      }
    };

    fetchIngredientDetails();
  }, [ingredienteId]);

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

          {/* Valor ANDI */}
          <Text style={styles.sectionTitle}>Valor ANDI: 30/100</Text>
          <Text style={styles.text}>
            El huevo tiene una densidad de nutrientes moderada, pero sigue
            siendo un buen alimento.
          </Text>

          {/* Descripción */}
          <Text style={styles.sectionTitle}>Descripción:</Text>
          <Text style={styles.text}>
            El huevo es una excelente fuente de proteínas de alta calidad y
            contiene todas las vitaminas y minerales esenciales, excepto la
            vitamina C. Es especialmente rico en colina, un nutriente importante
            para la salud cerebral.
          </Text>
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
  },
  tableCell: {
    fontSize: 14,
    color: "black",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EF5B23",
    marginTop: 10,
  },
  text: {
    fontSize: 16,
    color: "black",
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
});
