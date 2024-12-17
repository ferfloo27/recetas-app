export class UserModel {
  constructor(email) {
    this.email = email || "No disponible";
  }

  static fromFirebaseUser(firebaseUser) {
    return new UserModel(firebaseUser?.email);
  }
}
