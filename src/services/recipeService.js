import axios from "axios";

const API_KEY = "8bd09a6a0ec64444b1240f14e038989d";
export const fetchRandomRecipes = async (translateFunction) => {
  try {
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/random?apiKey=${API_KEY}&number=10&language=es` // Cambia el anúmero de recetas aleatorias
    );

    const recetasAleatorias = response.data.recipes;

    const translatedRecipes = await Promise.all(
      recetasAleatorias.map(async (recipe) => {
        const translatedTitle = await translateFunction(
          recipe.title,
          "en",
          "es"
        );
        return { ...recipe, title: translatedTitle };
      })
    );

    return translatedRecipes;

    // Verificar favoritos para estas recetas
    /*response.data.recipes.forEach(async (recipe) => {
      const isFavorite = await checkIfFavorite(recipe.id);
      setFavorites((prev) => ({ ...prev, [recipe.id]: isFavorite }));
    });*/
  } catch (error) {
    console.error("Error fetching random recipes:", error);
    throw error;
  }
};
