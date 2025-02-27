import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';

const AnswerScreen = ({ route, navigation }) => {
  const { selectedAnswers = [], questions = [] } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');

  const CHATGPT_API_KEY = process.env.CHATGPT_API_KEY; // Replace with your OpenAI API key




  useEffect(() => {
    if (questions[currentIndex] && selectedAnswers[currentIndex]) {
      fetchDescription(
        questions[currentIndex].question,
        selectedAnswers[currentIndex].answer,
        questions[currentIndex].correctAnswer
      );
    } else {
      setDescription("No data available for this question.");
    }
  }, [currentIndex]);

  const fetchDescription = async (question, userAnswer, correctAnswer) => {
    setLoading(true);
    try {
      const prompt = `Provide a concise 3-line description for the following trivia question: "${question}". 
User's answer: "${userAnswer}".
Correct answer: "${correctAnswer}".
Explain why the correct answer is correct and provide brief context.`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${CHATGPT_API_KEY}`,
          },
        }
      );

      const generatedText = response.data.choices[0]?.message?.content.trim();
      setDescription(generatedText || "Could not generate a description at this time.");
    } catch (error) {
      console.error('Error fetching description:', error);
      setDescription("Error generating description. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setDescription(''); // Reset description for the next question
    } else {
      Alert.alert("Quiz Completed", "You have completed the quiz. Redirecting to the homepage.", [
        {
          text: "OK",
          onPress: () => navigation.navigate('Home'), // Navigate to the Home screen
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {questions[currentIndex] ? (
        <>
          <Text style={styles.questionText}>Question:</Text>
          <Text style={styles.questionText}>{questions[currentIndex].question}</Text>
          <Text style={styles.correctAnswerText}>
            Correct Answer: {questions[currentIndex].correctAnswer}
          </Text>
          <Text style={styles.userAnswerText}>
            Your Answer: {selectedAnswers[currentIndex]?.answer || "No answer provided"}
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Text style={styles.descriptionText}>{description}</Text>
          )}

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text>No questions available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
    textAlign: 'center',
  },
  correctAnswerText: {
    fontSize: 18,
    color: '#4caf50',
    marginTop: 10,
    marginBottom: 5,
  },
  userAnswerText: {
    fontSize: 18,
    color: '#d32f2f',
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  nextButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AnswerScreen;
