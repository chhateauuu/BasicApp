import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';

const RandomQuestionsScreen = ({ route, navigation }) => {
  const { categories } = route.params; // Array of selected categories
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);

  useEffect(() => {
    const fetchRandomQuestions = async () => {
      try {
        const response = await axios.get('https://backend-yhta.onrender.com/api/random-questions', {
          params: { categories: categories.join(',') },
        });
        setQuestions(response.data.questions);
      } catch (error) {
        console.error('Error fetching random questions:', error.response?.data || error.message);
        Alert.alert('Error', 'Failed to fetch questions.');
      } finally {
        setLoading(false);
      }
    };

    fetchRandomQuestions();
  }, [categories]);

  const handleSelectAnswer = (option) => {
    const updatedAnswers = [...selectedAnswers, { question: questions[currentQuestionIndex], answer: option }];
    setSelectedAnswers(updatedAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      navigation.navigate('AnswerScreen', { selectedAnswers, questions }); // Redirect to AnswerScreen
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {questions.length > 0 ? (
        <View>
          <Text style={styles.questionText}>
            Q{currentQuestionIndex + 1}: {questions[currentQuestionIndex].question}
          </Text>
          {questions[currentQuestionIndex].options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.answerButton}
              onPress={() => handleSelectAnswer(option)}
            >
              <Text style={styles.answerText}>{String.fromCharCode(65 + index)}. {option}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  answerButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    marginVertical: 5,
  },
  answerText: {
    fontSize: 16,
  },
});

export default RandomQuestionsScreen;
