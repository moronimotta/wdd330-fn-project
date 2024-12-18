import { GoogleGenerativeAI } from "@google/generative-ai";
const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);
export async function promptSender(input_text, type) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = promptType(input_text, type);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = await response.text(); 
    console.log("Raw API Response:", text);

    text = text
      .replace(/```json/g, "") 
      .replace(/```/g, "")
      .replace(/\/\/.*$/gm, "")
      .trim();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(text);
    } catch (parseError) {
      throw new Error(`Failed to parse JSON: ${parseerror.error}`);
    }

    const formattedResponse = formatResponse(type, jsonResponse);
    console.log("Formatted Response:", formattedResponse);
    return formattedResponse;
  } catch (error) {
    console.error("Error in promptSender:", error);
    alert(`An error occurred: ${error.error}`);
    return null;
  }
}



function promptType(input_text, type) {
  switch (type) {
    case "recipe":
      return `Provide the recipe for "${input_text}". Structure the response strictly in JSON with these fields: {name, ingredients, fats, carbs, proteins, preparation_text}. Even if input variations exist, ensure the response adheres to the given JSON structure format strictly. If there are any fractions, write them in full text (e.g., "one-half", "one-quarter") instead of using symbols like ½ or ¼. Calculate the approximate total grams of fats, carbs, and proteins based on the given ingredients and their typical nutritional values. Return these approximations under "fats", "carbs", and "proteins".
`;
    case "nutrition":
      return `Provide the nutritional facts for ${input_text}. Structure the response strictly in JSON with this format: {name, quantity, protein, fat, carb}. Even if the input could vary, select one representative JSON example.`;
    default:
      throw new Error("Invalid prompt type. Supported types are: recipe, nutrition, macronutrient.");
  }
}

function formatResponse(type, response) {
  switch (type) {
    case "recipe":
      return formatRecipe(response);
    case "nutrition":
      return formatNutritionFacts(response);
   default:
      return response;
  }
}

function formatRecipe(response) {
  return {
    name: response.name || "",
    ingredients: response.ingredients || "",
    fats: response.fats || "",
    carbs: response.carbs || "",
    proteins: response.proteins || "",
    preparation: response.preparation_text || "",
  };
}

function formatNutritionFacts(response) {
  return {
    name: response.name || "",
    quantity: response.quantity || "",
    protein: response.protein || "",
    fat: response.fat || "",
    carb: response.carb || "",
  };
}