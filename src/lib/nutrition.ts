import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeFood = async (foodItem: string, userAllergies: string[], image?: File) => {
  try {
    console.log('Analyzing food:', foodItem, 'with allergies:', userAllergies, 'image:', !!image);
    const model = genAI.getGenerativeModel({ model: image ? 'gemini-1.5-flash' : 'gemini-1.5-flash' });
    
    const allergenList = userAllergies.join(', ');
    
    const prompt = `Analyze this food item for nutrition and allergies: "${foodItem}"

User's known allergies: ${allergenList || 'None specified'}

Please provide a detailed analysis including:
1. Nutritional information (calories per serving, protein, carbohydrates, fats, key vitamins/minerals)
2. Allergy warnings if any ingredients match user's allergies
3. Health score from 1-10 (10 being healthiest)
4. Recommendations for healthier alternatives or preparation methods
5. List of potential allergens present in this food

Format your response as a JSON object with these exact keys:
- nutrition: string (detailed nutritional breakdown)
- allergyWarnings: array of strings (specific warnings for user's allergies)
- healthScore: number (1-10)
- recommendations: array of strings (health recommendations)
- potentialAllergens: array of strings (all allergens that might be present)

Respond only with valid JSON, no additional text.`;

    let result;
    if (image) {
      const imageData = await fileToGenerativePart(image);
      result = await model.generateContent([prompt, imageData]);
    } else {
      result = await model.generateContent(prompt);
    }
    const response = await result.response;
    const text = response.text();
    console.log('AI Response:', text);
    
    try {
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      return parsed;
    } catch (parseError) {
      console.log('JSON parse error, using fallback:', parseError);
      // If JSON parsing fails, return a structured response
      return {
        nutrition: text,
        allergyWarnings: userAllergies.length > 0 ? [`Please check ingredients carefully for: ${allergenList}`] : [],
        healthScore: 7,
        recommendations: ['Consult with a nutritionist for personalized advice'],
        potentialAllergens: ['Check product labels for complete allergen information']
      };
    }
  } catch (error) {
    console.error('Error analyzing food:', error);
    // Return a fallback response instead of throwing
    return {
      nutrition: `Analysis for "${foodItem}" - Please consult nutrition labels for detailed information.`,
      allergyWarnings: userAllergies.length > 0 ? [`Please check ingredients for potential allergens: ${userAllergies.join(', ')}`] : [],
      healthScore: 5,
      recommendations: ['Check ingredient labels carefully', 'Consult with healthcare provider for dietary advice'],
      potentialAllergens: ['Common allergens may be present - check labels']
    };
  }
};

const fileToGenerativePart = async (file: File) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      });
    };
    reader.readAsDataURL(file);
  });
};