import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import FormulaAndi from "./FormulaAndi";

export default function InformacionAndi() {
  // Definimos los rangos y sus colores correspondientes
  const rangosAndi = [
    { rango: "0 - 10", descripcion: "Muy baja densidad", color: "#FF4C4C" }, // Rojo
    { rango: "11 - 200", descripcion: "Baja densidad", color: "#FF8C42" }, // Naranja
    { rango: "201 - 400", descripcion: "Regular", color: "#FFD700" }, // Amarillo
    { rango: "401 - 800", descripcion: "Buena densidad", color: "#90EE90" }, // Verde claro
    {
      rango: "801 - 1000",
      descripcion: "Excelente densidad",
      color: "#228B22",
    }, // Verde oscuro
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>¿Qué son los valores ANDI?</Text>
      <Text style={styles.text}>
        ANDI (Aggregate Nutrient Density Index) es un índice que mide la
        densidad de nutrientes de un alimento en relación con su contenido
        calórico. Los alimentos con un alto valor ANDI son aquellos que aportan
        más nutrientes esenciales por cada caloría consumida.
      </Text>

      <Text style={styles.subtitle}>¿Cómo se calculan?</Text>
      <Text style={styles.text}>
        Los valores ANDI se calculan tomando en cuenta varios nutrientes como
        vitaminas, minerales, antioxidantes y otros factores beneficiosos para
        la salud, asignándoles un puntaje en función de su densidad en el
        alimento y ajustando por el contenido calórico. Los valores pueden ir de
        1 a 1000, siendo 1000 el máximo posible.
      </Text>
      <FormulaAndi />

      <Text style={styles.subtitle}>Rango de valores ANDI:</Text>
      <View style={styles.table}>
        {/* Encabezado de la tabla */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.headerCell]}>Rango</Text>
          <Text style={[styles.tableCell, styles.headerCell]}>Descripción</Text>
        </View>
        {/* Filas con colores según rango */}
        {rangosAndi.map((item, index) => (
          <View
            key={index}
            style={[styles.tableRow, { backgroundColor: item.color }]}
          >
            <Text style={[styles.tableCell, styles.cellText]}>
              {item.rango}
            </Text>
            <Text style={[styles.tableCell, styles.cellText]}>
              {item.descripcion}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FEF6F0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EF5B23",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EF5B23",

    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 15,
  },
  table: {
    borderWidth: 1,
    borderColor: "#EF5B23",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  tableHeader: {
    backgroundColor: "#fff",
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    padding: 5,
  },
  headerCell: {
    color: "#EF5B23",
    fontWeight: "bold",
  },
  cellText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
