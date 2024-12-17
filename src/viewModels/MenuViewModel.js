import { useState, useEffect, useCallback } from "react";
import { getDailyNutrients } from "../services/firebaseService";
import { useFocusEffect } from "@react-navigation/native";

export const useMenuViewModel = () => {
  const [nutrientTotals, setNutrientTotals] = useState({
    carbohydrates: 0,
    protein: 0,
    fat: 0,
  });

  const meals = [
    { id: "1", name: "Desayuno", periodo: "06:00 AM a 09:00 AM" },
    { id: "2", name: "Colación", periodo: "10:00 AM a 12:00 AM" },
    { id: "3", name: "Almuerzo", periodo: "12:00 AM a 02:00 PM" },
    { id: "4", name: "Merienda", periodo: "04:00 PM a 06:00 PM" },
    { id: "5", name: "Cena", periodo: "07:00 PM a 09:00 PM" },
    { id: "6", name: "Postre", periodo: "Después de la cena o almuerzo" },
  ];

  const fetchNutrients = useCallback(async () => {
    const nutrients = await getDailyNutrients();
    setNutrientTotals(nutrients);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNutrients();
    }, [fetchNutrients])
  );

  return { meals, nutrientTotals };
};
