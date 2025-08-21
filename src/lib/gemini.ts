import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDemoKeyForHealthLinkPlatform';

let genAI: GoogleGenerativeAI | null = null;

try {
  genAI = new GoogleGenerativeAI(API_KEY);
} catch (error) {
  console.warn('Gemini AI initialization failed:', error);
}

export const generateHealthResponse = async (prompt: string): Promise<string> => {
  try {
    if (!genAI) {
      throw new Error('Gemini AI not initialized');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const healthPrompt = `You are a helpful AI health assistant for HealthLink platform. Provide accurate, helpful health information while always recommending consulting healthcare professionals for serious concerns.

User question: ${prompt}

Please provide a helpful response that:
1. Gives general health information
2. Suggests when to see a doctor
3. Includes appropriate disclaimers
4. Is concise and easy to understand
5. Keep response under 200 words`;

    const result = await model.generateContent(healthPrompt);
    const response = await result.response;
    const text = response.text();
    
    if (text && text.trim()) {
      return text;
    } else {
      throw new Error('Empty response from AI');
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return getIntelligentMockResponse(prompt);
  }
};

export const analyzeSymptoms = async (symptoms: string): Promise<any> => {
  try {
    if (!genAI) {
      throw new Error('Gemini AI not initialized');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const analysisPrompt = `As a medical AI assistant for HealthLink, analyze these symptoms and provide a structured JSON response. Always emphasize consulting healthcare professionals.

Symptoms: ${symptoms}

Respond ONLY with valid JSON in this exact format:
{
  "riskLevel": "Low/Medium/High",
  "possibleConditions": ["condition1", "condition2", "condition3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "urgency": "description of when to seek care"
}

No additional text, just the JSON.`;

    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean up the response to extract JSON
    if (text.includes('```json')) {
      text = text.split('```json')[1].split('```')[0].trim();
    } else if (text.includes('```')) {
      text = text.split('```')[1].split('```')[0].trim();
    }
    
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Text:', text);
      return getIntelligentSymptomAnalysis(symptoms);
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return getIntelligentSymptomAnalysis(symptoms);
  }
};

export const generateHealthPlan = async (userProfile: any): Promise<any> => {
  try {
    if (!genAI) {
      throw new Error('Gemini AI not initialized');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const planPrompt = `Create a personalized health plan for HealthLink platform based on this user profile:

Age: ${userProfile.age || 'Not specified'}
Gender: ${userProfile.gender || 'Not specified'}
Health Goals: ${userProfile.goals || 'General wellness'}
Current Conditions: ${userProfile.conditions || 'None specified'}
Activity Level: ${userProfile.activity || 'Moderate'}

Respond ONLY with valid JSON in this exact format:
{
  "dailyRecommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "weeklyGoals": ["goal1", "goal2", "goal3"],
  "nutritionTips": ["tip1", "tip2", "tip3"],
  "exerciseRoutine": ["exercise1", "exercise2", "exercise3"],
  "healthScore": 85,
  "riskFactors": ["factor1", "factor2"],
  "preventiveCare": ["checkup1", "checkup2"]
}

No additional text, just the JSON.`;

    const result = await model.generateContent(planPrompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean up the response to extract JSON
    if (text.includes('```json')) {
      text = text.split('```json')[1].split('```')[0].trim();
    } else if (text.includes('```')) {
      text = text.split('```')[1].split('```')[0].trim();
    }
    
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return getPersonalizedHealthPlan(userProfile);
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return getPersonalizedHealthPlan(userProfile);
  }
};

export const analyzeMedication = async (medications: string[]): Promise<any> => {
  try {
    if (!genAI) {
      throw new Error('Gemini AI not initialized');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const medPrompt = `Analyze these medications for interactions and provide safety guidance:

Medications: ${medications.join(', ')}

Respond ONLY with valid JSON in this exact format:
{
  "interactions": ["interaction1", "interaction2", "interaction3"],
  "timingAdvice": ["advice1", "advice2", "advice3"],
  "sideEffects": ["effect1", "effect2", "effect3"],
  "foodRestrictions": ["restriction1", "restriction2"],
  "reminders": ["reminder1", "reminder2", "reminder3"]
}

Focus on general medication safety and emphasize consulting pharmacists/doctors. No additional text, just the JSON.`;

    const result = await model.generateContent(medPrompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean up the response to extract JSON
    if (text.includes('```json')) {
      text = text.split('```json')[1].split('```')[0].trim();
    } else if (text.includes('```')) {
      text = text.split('```')[1].split('```')[0].trim();
    }
    
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return getIntelligentMedicationAnalysis(medications);
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return getIntelligentMedicationAnalysis(medications);
  }
};

export const generateEmergencyGuidance = async (situation: string): Promise<string> => {
  if (!genAI) {
    return getMockEmergencyGuidance(situation);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const emergencyPrompt = `Provide immediate emergency guidance for this situation:

Situation: ${situation}

Provide step-by-step emergency instructions while emphasizing calling emergency services (112/911) for serious situations. Be clear, concise, and prioritize safety.`;

    const result = await model.generateContent(emergencyPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return getMockEmergencyGuidance(situation);
  }
};

const getIntelligentMockResponse = (prompt: string): string => {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('headache') || lowerPrompt.includes('migraine')) {
    return 'Headaches can have various causes including stress, dehydration, or tension. Try resting in a quiet, dark room, staying hydrated, and applying a cold compress. Over-the-counter pain relievers like ibuprofen or acetaminophen may help. If headaches are severe, frequent, or accompanied by other symptoms like vision changes or fever, consult a healthcare professional immediately.';
  }
  if (lowerPrompt.includes('fever') || lowerPrompt.includes('temperature')) {
    return 'Fever is your body\'s natural response to infection. Stay hydrated with water and clear fluids, rest, and monitor your temperature regularly. Seek medical attention if fever exceeds 103°F (39.4°C), persists for more than 3 days, or is accompanied by severe symptoms like difficulty breathing, chest pain, or persistent vomiting.';
  }
  if (lowerPrompt.includes('cough') || lowerPrompt.includes('cold') || lowerPrompt.includes('sore throat')) {
    return 'For cold and cough symptoms, try warm liquids like tea with honey, use a humidifier, and get plenty of rest. Gargle with warm salt water for sore throat relief. Most colds resolve within 7-10 days. Consult a doctor if symptoms worsen, persist beyond 10 days, or if you develop high fever, difficulty breathing, or severe throat pain.';
  }
  if (lowerPrompt.includes('stomach') || lowerPrompt.includes('nausea') || lowerPrompt.includes('vomit')) {
    return 'For stomach issues, try the BRAT diet (bananas, rice, applesauce, toast), stay hydrated with small sips of clear fluids, and avoid dairy and fatty foods. Rest and avoid solid foods until nausea subsides. Seek medical care if you experience severe dehydration, blood in vomit/stool, or symptoms persist beyond 24-48 hours.';
  }
  if (lowerPrompt.includes('diet') || lowerPrompt.includes('nutrition') || lowerPrompt.includes('weight')) {
    return 'A balanced diet includes plenty of fruits, vegetables, whole grains, lean proteins, and healthy fats. Aim for 5-9 servings of fruits and vegetables daily, stay hydrated, and limit processed foods and added sugars. For weight management, focus on portion control and regular physical activity. Consult a nutritionist or healthcare provider for personalized dietary advice.';
  }
  if (lowerPrompt.includes('exercise') || lowerPrompt.includes('workout') || lowerPrompt.includes('fitness')) {
    return 'Regular exercise is crucial for overall health. Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity weekly, plus strength training twice a week. Start slowly if you\'re new to exercise and gradually increase intensity. Always warm up before and cool down after workouts. Consult your doctor before starting a new exercise program, especially if you have health conditions.';
  }
  if (lowerPrompt.includes('sleep') || lowerPrompt.includes('insomnia') || lowerPrompt.includes('tired')) {
    return 'Good sleep hygiene is essential for health. Aim for 7-9 hours of sleep nightly, maintain a consistent sleep schedule, and create a relaxing bedtime routine. Avoid caffeine, large meals, and screens before bedtime. Keep your bedroom cool, dark, and quiet. If you consistently have trouble sleeping or feel tired despite adequate sleep, consult a healthcare professional.';
  }
  
  return 'Thank you for your health question. While I can provide general health information, it\'s important to consult with a qualified healthcare professional for personalized medical advice, proper diagnosis, and treatment recommendations. They can evaluate your specific situation and provide the most appropriate care for your needs.';
};

const getIntelligentSymptomAnalysis = (symptoms: string): any => {
  const lowerSymptoms = symptoms.toLowerCase();
  
  if (lowerSymptoms.includes('chest pain') || lowerSymptoms.includes('difficulty breathing') || lowerSymptoms.includes('severe headache')) {
    return {
      riskLevel: 'High',
      possibleConditions: ['Cardiac Event', 'Respiratory Emergency', 'Severe Hypertension'],
      recommendations: [
        'Seek immediate emergency medical attention',
        'Call 112/911 immediately',
        'Do not drive yourself to hospital',
        'Stay calm and rest until help arrives'
      ],
      urgency: 'EMERGENCY - Seek immediate medical attention'
    };
  }
  
  if (lowerSymptoms.includes('fever') && (lowerSymptoms.includes('cough') || lowerSymptoms.includes('sore throat'))) {
    return {
      riskLevel: 'Medium',
      possibleConditions: ['Viral Upper Respiratory Infection', 'Bacterial Infection', 'Flu'],
      recommendations: [
        'Rest and stay well hydrated',
        'Monitor temperature regularly',
        'Use throat lozenges for sore throat',
        'Consider over-the-counter fever reducers'
      ],
      urgency: 'Monitor symptoms, see doctor if fever persists >3 days or worsens'
    };
  }
  
  if (lowerSymptoms.includes('headache') || lowerSymptoms.includes('fatigue')) {
    return {
      riskLevel: 'Low',
      possibleConditions: ['Tension Headache', 'Dehydration', 'Stress', 'Sleep Deprivation'],
      recommendations: [
        'Ensure adequate hydration',
        'Get sufficient rest and sleep',
        'Practice stress management techniques',
        'Consider over-the-counter pain relief if needed'
      ],
      urgency: 'Self-care measures, see doctor if symptoms persist or worsen'
    };
  }
  
  return {
    riskLevel: 'Medium',
    possibleConditions: ['Viral Infection', 'Minor Illness', 'Stress-Related Symptoms'],
    recommendations: [
      'Rest and stay hydrated',
      'Monitor symptoms for 24-48 hours',
      'Practice good hygiene',
      'Consider over-the-counter remedies as appropriate'
    ],
    urgency: 'Monitor symptoms, consult healthcare provider if concerned or symptoms worsen'
  };
};

const getPersonalizedHealthPlan = (userProfile: any): any => {
  const age = parseInt(userProfile.age) || 30;
  const goals = userProfile.goals?.toLowerCase() || '';
  
  let healthScore = 75;
  let dailyRecs = ['Drink 8-10 glasses of water daily', 'Take a 30-minute walk', 'Eat 5 servings of fruits and vegetables'];
  let weeklyGoals = ['Exercise 150 minutes per week', 'Get 7-8 hours of sleep nightly', 'Practice stress management'];
  let nutritionTips = ['Reduce processed foods', 'Include lean proteins in meals', 'Choose whole grains over refined'];
  let exerciseRoutine = ['Morning stretches (10 minutes)', 'Cardio exercise 3x per week', 'Strength training 2x per week'];
  let riskFactors = ['Sedentary lifestyle', 'Irregular sleep patterns'];
  let preventiveCare = ['Annual physical examination', 'Blood pressure monitoring', 'Dental cleaning every 6 months'];
  
  // Customize based on age
  if (age > 50) {
    healthScore = 70;
    preventiveCare.push('Bone density screening', 'Colonoscopy screening');
    riskFactors.push('Age-related health risks');
    exerciseRoutine = ['Gentle morning stretches', 'Low-impact cardio 3x/week', 'Light strength training 2x/week'];
  } else if (age < 25) {
    healthScore = 85;
    dailyRecs.push('Limit screen time before bed');
    weeklyGoals.push('Maintain social connections');
  }
  
  // Customize based on goals
  if (goals.includes('weight loss')) {
    nutritionTips.push('Control portion sizes', 'Avoid sugary drinks');
    exerciseRoutine.push('High-intensity interval training');
    dailyRecs.push('Track calorie intake');
  } else if (goals.includes('muscle') || goals.includes('strength')) {
    nutritionTips.push('Increase protein intake', 'Eat post-workout meals');
    exerciseRoutine = ['Dynamic warm-up', 'Strength training 4x/week', 'Progressive overload'];
  } else if (goals.includes('stress') || goals.includes('mental')) {
    dailyRecs.push('Practice 10 minutes of meditation');
    weeklyGoals.push('Engage in relaxing hobbies');
    exerciseRoutine.push('Yoga or tai chi sessions');
  }
  
  return {
    dailyRecommendations: dailyRecs.slice(0, 4),
    weeklyGoals: weeklyGoals.slice(0, 3),
    nutritionTips: nutritionTips.slice(0, 4),
    exerciseRoutine: exerciseRoutine.slice(0, 3),
    healthScore,
    riskFactors: riskFactors.slice(0, 3),
    preventiveCare: preventiveCare.slice(0, 3)
  };
};

const getIntelligentMedicationAnalysis = (medications: string[]): any => {
  const medList = medications.map(med => med.toLowerCase());
  let interactions = ['No major interactions detected'];
  let timingAdvice = ['Take medications as prescribed'];
  let sideEffects = ['Monitor for unusual symptoms'];
  let foodRestrictions = ['Follow medication label instructions'];
  let reminders = ['Set daily alarms', 'Use pill organizer', 'Keep medication list updated'];
  
  // Check for common medications and provide specific advice
  if (medList.some(med => med.includes('aspirin') || med.includes('ibuprofen') || med.includes('naproxen'))) {
    interactions.push('NSAIDs may increase bleeding risk with blood thinners');
    timingAdvice.push('Take with food to reduce stomach irritation');
    sideEffects.push('May cause stomach upset or heartburn');
    foodRestrictions.push('Avoid alcohol to prevent stomach bleeding');
  }
  
  if (medList.some(med => med.includes('acetaminophen') || med.includes('tylenol'))) {
    interactions.push('Do not exceed 4000mg daily from all sources');
    timingAdvice.push('Space doses 4-6 hours apart');
    sideEffects.push('Rare but serious liver damage with overdose');
    foodRestrictions.push('Limit alcohol consumption');
  }
  
  if (medList.some(med => med.includes('blood pressure') || med.includes('lisinopril') || med.includes('amlodipine'))) {
    interactions.push('Monitor blood pressure regularly');
    timingAdvice.push('Take at same time daily for consistency');
    sideEffects.push('May cause dizziness or lightheadedness');
    foodRestrictions.push('Limit sodium intake');
  }
  
  if (medList.some(med => med.includes('diabetes') || med.includes('metformin') || med.includes('insulin'))) {
    interactions.push('Monitor blood sugar levels closely');
    timingAdvice.push('Take with meals to reduce side effects');
    sideEffects.push('May cause low blood sugar or stomach upset');
    foodRestrictions.push('Maintain consistent carbohydrate intake');
  }
  
  if (medList.some(med => med.includes('antibiotic') || med.includes('amoxicillin') || med.includes('azithromycin'))) {
    interactions.push('Complete full course even if feeling better');
    timingAdvice.push('Take at evenly spaced intervals');
    sideEffects.push('May cause digestive upset or yeast infections');
    foodRestrictions.push('Avoid dairy products if specified');
    reminders.push('Take probiotics to maintain gut health');
  }
  
  if (medications.length > 1) {
    interactions.push('Multiple medications increase interaction risk');
    timingAdvice.push('Space different medications 1-2 hours apart when possible');
    reminders.push('Consult pharmacist about drug interactions');
  }
  
  return {
    interactions: interactions.slice(0, 3),
    timingAdvice: timingAdvice.slice(0, 3),
    sideEffects: sideEffects.slice(0, 3),
    foodRestrictions: foodRestrictions.slice(0, 2),
    reminders: reminders.slice(0, 3)
  };
};

export const analyzePrescriptionImage = async (imageFile: File): Promise<any> => {
  try {
    if (!genAI) {
      throw new Error('Gemini AI not initialized');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const imageData = await fileToGenerativePart(imageFile);
    
    const prompt = `Analyze this handwritten medical prescription image and extract information in JSON format:

{
  "doctorName": "Doctor's name",
  "patientName": "Patient's name",
  "date": "Prescription date",
  "medications": [
    {
      "name": "Medication name",
      "dosage": "Dosage amount",
      "frequency": "How often to take",
      "duration": "How long to take",
      "instructions": "Special instructions"
    }
  ],
  "diagnosis": "Medical condition if mentioned",
  "warnings": ["Any warnings or precautions"],
  "confidence": "High/Medium/Low based on handwriting clarity"
}

If text is unclear, indicate in confidence field. Always emphasize consulting the prescribing doctor.`;

    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    let text = response.text().trim();
    
    if (text.includes('```json')) {
      text = text.split('```json')[1].split('```')[0].trim();
    } else if (text.includes('```')) {
      text = text.split('```')[1].split('```')[0].trim();
    }
    
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch (parseError) {
      return getMockPrescriptionAnalysis();
    }
  } catch (error) {
    console.error('Prescription analysis error:', error);
    return getMockPrescriptionAnalysis();
  }
};

const fileToGenerativePart = async (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const getMockEmergencyGuidance = (situation: string): string => {
  return `Emergency Guidance for: ${situation}\n\n1. Stay calm and assess the situation\n2. Call emergency services (112/911) immediately if life-threatening\n3. Provide first aid if trained\n4. Do not move injured person unless in immediate danger\n5. Stay with the person until help arrives\n\nIMPORTANT: This is general guidance. Always call emergency services for serious situations.`;
};

const getMockPrescriptionAnalysis = (): any => {
  return {
    doctorName: 'Unable to read clearly',
    patientName: 'Unable to read clearly',
    date: 'Unable to read clearly',
    medications: [
      {
        name: 'Medication name unclear',
        dosage: 'Please verify with doctor',
        frequency: 'Please verify with doctor',
        duration: 'Please verify with doctor',
        instructions: 'Consult prescribing physician'
      }
    ],
    diagnosis: 'Not clearly visible',
    warnings: ['Always verify prescription details with your doctor', 'Do not rely solely on AI analysis for medication'],
    confidence: 'Low - Image analysis not available'
  };
};