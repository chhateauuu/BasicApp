import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const TriviaScreen = ({ route }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const navigation = useNavigation();

  const { category, subDomain } = route.params;

  const API_BASE_URL = `https://backend-yhta.onrender.com`; // Replace with your local IP address
  const QUESTIONS_API_URL = `${API_BASE_URL}/api/questions?category=${category}&subDomain=${subDomain}`;

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log(QUESTIONS_API_URL)
        const response = await axios.get(QUESTIONS_API_URL);
       
        console.log('API Response:', response);

        const allQuestions = response.data.questions;

        // Select 10 random questions
        const shuffledQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);

        setQuestions(shuffledQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [category, subDomain]);

  const handleSelectAnswer = (option, index) => {
    setSelectedOption(index);
    const updatedAnswers = [...selectedAnswers, { question: questions[currentQuestionIndex].question, answer: option }];
    setSelectedAnswers(updatedAnswers);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setSelectedOption(null);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Navigate to the results/answer screen
        navigation.navigate('AnswerScreen', { selectedAnswers, questions });
      }
    }, 500);
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
          <Text style={styles.questionText}>{questions[currentQuestionIndex].question}</Text>
          {questions[currentQuestionIndex].options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSelectAnswer(option, index)}
              style={[
                styles.answerButton,
                selectedOption === index && styles.selectedAnswerButton,
              ]}
            >
              <Text style={styles.answerText}>
                {String.fromCharCode(65 + index)}. {option}
              </Text>
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
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  answerButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    marginVertical: 5,
  },
  selectedAnswerButton: {
    backgroundColor: '#4caf50',
  },
  answerText: {
    fontSize: 16,
  },
});

export default TriviaScreen;
