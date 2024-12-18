import React from "react";
import { Svg, Text, Line, TSpan } from "react-native-svg";

export default function FormulaAndi() {
  return (
    <Svg height="120" width="320" viewBox="0 0 469 120">
      {/* ANDI = */}
      <Text x="5" y="30" fontSize="18" fontWeight="bold">
        ANDI =
      </Text>

      {/* SUM symbol */}
      <Text x="60" y="30" fontSize="30" fontWeight="bold">
        ∑
      </Text>

      {/* ( Ponderación del Nutriente x */}
      <Text x="77" y="30" fontSize="16">
        ( Ponderación del Nutriente
      </Text>

      <Text x="275" y="35" fontSize="24" fontWeight="bold">
        x
      </Text>

      {/* Numerator */}
      <Text x="290" y="20" fontSize="16">
        Cantidad del nutriente
      </Text>

      {/* Line */}
      <Line x1="295" y1="30" x2="450" y2="30" stroke="black" strokeWidth="1" />

      {/* Denominator */}
      <Text x="350" y="50" fontSize="16">
        Calorías
      </Text>

      {/* Closing parenthesis */}
      <Text x="454" y="30" fontSize="16">
        )
      </Text>
    </Svg>
  );
}
