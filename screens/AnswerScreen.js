import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';
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

  const isCorrect = questions[currentIndex] && 
                   selectedAnswers[currentIndex] && 
                   questions[currentIndex].correctAnswer === selectedAnswers[currentIndex].answer;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f7f7" />
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Results</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentIndex + 1) / questions.length) * 100}%` }
            ]} 
          />
        </View>
      </View>
      
      <View style={styles.container}>
        {questions[currentIndex] ? (
          <>
            <View style={styles.questionCard}>
              <Text style={styles.questionCounter}>Question {currentIndex + 1} of {questions.length}</Text>
              <Text style={styles.questionTitle}>Question:</Text>
              <Text style={styles.questionText}>{questions[currentIndex].question}</Text>
              
              <View style={styles.answerSection}>
                <View style={styles.correctAnswerContainer}>
                  <Text style={styles.answerLabel}>Correct Answer:</Text>
                  <Text style={styles.correctAnswerText}>
                    {questions[currentIndex].correctAnswer}
                  </Text>
                </View>
                
                <View style={[styles.userAnswerContainer, isCorrect ? styles.correctBg : styles.incorrectBg]}>
                  <Text style={styles.answerLabel}>Your Answer:</Text>
                  <Text style={[styles.userAnswerText, isCorrect ? styles.correctText : styles.incorrectText]}>
                    {selectedAnswers[currentIndex]?.answer || "No answer provided"}
                  </Text>
                </View>

                {loading ? (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="small" color="#A78BFA" />
                    <Text style={styles.loaderText}>Loading explanation...</Text>
                  </View>
                ) : (
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionLabel}>Explanation:</Text>
                    <Text style={styles.descriptionText}>{description}</Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.noQuestionsText}>No questions available.</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginTop: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A78BFA',
    borderRadius: 3,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionCounter: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 5,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1F2937',
    textAlign: 'center',
  },
  answerSection: {
    width: '100%',
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#4B5563',
  },
  correctAnswerContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  userAnswerContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  correctBg: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  incorrectBg: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  correctAnswerText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '500',
  },
  userAnswerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  correctText: {
    color: '#10B981',
  },
  incorrectText: {
    color: '#EF4444',
  },
  loaderContainer: {
    alignItems: 'center',
    padding: 15,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  descriptionContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4B5563',
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    textAlign: 'left',
  },
  nextButton: {
    backgroundColor: '#A78BFA',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noQuestionsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default AnswerScreen;
