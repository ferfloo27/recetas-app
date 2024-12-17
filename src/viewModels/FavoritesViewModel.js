import { useState, useEffect } from "react";
import { auth, db } from "../../firebase-config";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { translateText } from "../services/translationService";
import { RecipeModel } from "../models/RecipeModel";

const useFavoritesViewModel = () => {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [error, setError] = useState(null);

  const fetchFavoritesForUser = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError("No hay un usuario logueado");
      return;
    }

    const userId = user.uid;
    const favoritesCollectionRef = collection(db, "users", userId, "favorites");

    try {
      const querySnapshot = await getDocs(favoritesCollectionRef);

      const favoritesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Traduce títulos
      const translatedRecipes = await Promise.all(
        favoritesData.map(async (recipe) => {
          const translatedTitle = await translateText(recipe.title, "en", "es");
          return new RecipeModel(recipe.id, translatedTitle, recipe.image);
        })
      );

      setFavoriteRecipes(translatedRecipes);
    } catch (error) {
      console.error("Error al cargar favoritos:", error);
      setError("No se pudieron cargar las recetas favoritas.");
    }
  };

  const removeFavorite = async (recipeId) => {
    const user = auth.currentUser;
    if (!user) return;

    const userId = user.uid;
    const recipeDocRef = doc(db, "users", userId, "favorites", recipeId);

    try {
      await deleteDoc(recipeDocRef);
      setFavoriteRecipes((prevFavorites) =>
        prevFavorites.filter((recipe) => recipe.id !== recipeId)
      );
    } catch (error) {
      console.error("Error al eliminar favorito:", error);
    }
  };

  useEffect(() => {
    fetchFavoritesForUser();
  }, []);

  return { favoriteRecipes, error, removeFavorite };
};

export default useFavoritesViewModel;
