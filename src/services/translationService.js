import axios from "axios";

const API_KEY_GOOGLE = "AIzaSyAauh--gJeN_HHVKY2mW_AF7b89JdQ2LOk";
export const translateText = async (
  text,
  sourceLang = "en",
  targetLang = "es"
) => {
  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${API_KEY_GOOGLE}&q=${text}&source=${sourceLang}&target=${targetLang}`
    );
    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error("Error translating text:", error);
    return text; // Devuelve el texto original si hay un error
  }
};
