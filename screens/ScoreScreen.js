import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';

const ScoreScreen = ({ route, navigation }) => {
  const { selectedAnswers = [], questions = [] } = route.params;
  const [score, setScore] = useState(0);

  // Calculate score when the component mounts or data changes
  useEffect(() => {
    let correctCount = 0;
    selectedAnswers.forEach((selected, index) => {
      // Ensure questions[index] exists before accessing correctAnswer
      if (questions[index] && selected.answer === questions[index].correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
  }, [selectedAnswers, questions]); // Recalculate if data changes

  const handleReviewAnswers = () => {
    // Navigate to AnswerScreen, passing the same data along
    navigation.navigate('AnswerScreen', { selectedAnswers, questions });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f7f7" />
      <View style={styles.container}>
        <View style={styles.scoreCard}>
          <Text style={styles.title}>Quiz Complete!</Text>
          <Text style={styles.scoreText}>Your Score:</Text>
          <Text style={styles.scoreValue}>
            {score} / {questions.length}
          </Text>
          <TouchableOpacity style={styles.reviewButton} onPress={handleReviewAnswers}>
            <Text style={styles.reviewButtonText}>Review Answers</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  scoreCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 30,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#A78BFA', // Using a theme color
    marginBottom: 30,
  },
  reviewButton: {
    backgroundColor: '#A78BFA',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ScoreScreen;