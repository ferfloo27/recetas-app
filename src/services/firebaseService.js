import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase-config";
import { getAuth, signOut } from "firebase/auth";

export const logoutUser = async () => {
  const auth = getAuth();
  await signOut(auth);
};

export const getCurrentUser = () => {
  const auth = getAuth();
  return auth.currentUser;
};

// Función para obtener nutrientes diarios
export const getDailyNutrients = async () => {
  const userId = auth.currentUser?.uid;
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const dailyMenuRef = doc(db, `users/${userId}/dailyMenu/${formattedDate}`);

  try {
    const snapshot = await getDoc(dailyMenuRef);
    if (snapshot.exists()) {
      return (
        snapshot.data().nutrientes || { carbohydrates: 0, protein: 0, fat: 0 }
      );
    }
  } catch (error) {
    console.error("Error fetching nutrients:", error);
  }
  return { carbohydrates: 0, protein: 0, fat: 0 }; // Valor por defecto
};
