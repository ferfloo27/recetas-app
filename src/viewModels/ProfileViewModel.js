import { useState } from "react";
import { logoutUser, getCurrentUser } from "../services/firebaseService";
import { UserModel } from "../models/UserModel";

export const useProfileViewModel = (navigation) => {
  const [user, setUser] = useState(() =>
    UserModel.fromFirebaseUser(getCurrentUser())
  );

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }], // Reinicia la navegación en la pantalla de Login
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw new Error("Ocurrió un error al cerrar sesión.");
    }
  };

  return { user, handleLogout };
};
