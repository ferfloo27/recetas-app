export class RecipeModel {
  constructor(id, title, image) {
    this.id = id;
    this.title = title;
    this.image = image || "https://via.placeholder.com/80";
  }
}
