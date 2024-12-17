export class DetailRecipeModel {
  constructor({ id, title, image, summary, ingredients, steps }) {
    this.id = id;
    this.title = title || "Sin título";
    this.image = image || "https://via.placeholder.com/150";
    this.summary = summary || "No disponible";
    this.ingredients = ingredients || [];
    this.steps = steps || [];
  }

  static fromApiResponse(response) {
    return new DetailRecipeModel({
      id: response.id,
      title: response.title,
      image: response.image,
      summary: response.summary,
      ingredients: response.extendedIngredients.map((ingredient) => ({
        id: ingredient.id,
        original: ingredient.original,
      })),
      steps: response.analyzedInstructions.flatMap((instruction) =>
        instruction.steps.map((step) => step.step)
      ),
    });
  }
}
