import { fetchRandomRecipes } from "../services/recipeService";
import { translateText } from "../services/translationService";
import { auth, db } from "../../firebase-config";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";

const fetchRecipesWithFavorites = async () => {
  try {
    const recipes = await fetchRandomRecipes(translateText);

    const user = auth.currentUser;
    const favorites = {};

    if (user) {
      for (const recipe of recipes) {
        favorites[recipe.id] = await checkIfFavorite(recipe.id, user.uid);
      }
    }

    return { recipes, favorites };
  } catch (error) {
    throw new Error("Error loading recipes");
  }
};

const checkIfFavorite = async (recipeId, userId) => {
  const docRef = doc(db, "users", userId, "favorites", recipeId.toString());
  try {
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error("Error checking favorite:", error);
    return false;
  }
};

const toggleFavorite = async (recipe, userId, isFavorite) => {
  const docRef = doc(db, "users", userId, "favorites", recipe.id.toString());

  try {
    if (isFavorite) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
      });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
};

export { fetchRecipesWithFavorites, toggleFavorite };
