import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Dimensions, SafeAreaView } from 'react-native';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';

import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const UserPerformanceScreen = ({ route }) => {
  const navigation = useNavigation();
  const userEmail = route.params.userEmail;
  const [userId, setUserId] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get(`http://localhost:6000/api/user-id?email=${userEmail}`);
        if (response.data.userId) {
          setUserId(response.data.userId);
        } else {
          console.error('User ID not found for email:', userEmail);
        }
      } catch (err) {
        console.error('Failed to fetch user ID:', err);
      }
    };

    if (userEmail) {
      fetchUserId();
    }
  }, [userEmail]);

  useEffect(() => {
    const fetchUserScores = async () => {
      try {
        const response = await axios.get('http://localhost:6000/api/repeated-scores-timeline');
        const userData = response.data[userId];

        if (userData) {
          const userScores = userData.map(item => ({
            attempt: item.attempt,
            score: item.score,
            status: item.status,
            timestamp: item.timestamp,
          }));

          userScores.sort((a, b) => a.attempt - b.attempt);
          setScores(userScores);
        } else {
          setScores([]);  // No data for user
        }
      } catch (err) {
        console.error('Failed to fetch scores:', err);
        setScores([]); // In case of error, treat as no data
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserScores();
    }
  }, [userId]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </SafeAreaView>
    );
  }

  if (!scores.length) {
    return (
      <SafeAreaView style={styles.noDataContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 18, color: '#4B0082' }}>← </Text>
          <Text style={{ fontSize: 16, color: '#4B0082', marginLeft: 4 }}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.noDataText}>No data available</Text>
      </SafeAreaView>
    );
  }

  const chartData = {
    labels: scores.map((_, i) => `${i + 1}`),
    datasets: [
      {
        data: scores.map(s => s.score),
        strokeWidth: 2,
        color: () => `#7C3AED`,
      },
    ],
  };

  const improvement = scores.length > 1
    ? scores[scores.length - 1].score - scores[0].score
    : null;

  let improvementText = '';
  if (improvement > 0) {
    improvementText = `📈 Improved by ${improvement} point${improvement > 1 ? 's' : ''} since the first attempt.`;
  } else if (improvement < 0) {
    improvementText = `📉 Decreased by ${Math.abs(improvement)} point${Math.abs(improvement) > 1 ? 's' : ''} since the first attempt.`;
  } else if (improvement === 0 && scores.length > 1) {
    improvementText = `➖ No change in performance since the first attempt.`;
  }

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 29, 149, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(76, 29, 149, ${opacity})`,
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#4B0082',
    },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 18, color: '#4B0082' }}>← </Text>
          <Text style={{ fontSize: 16, color: '#4B0082', marginLeft: 4 }}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Coginitive Performance</Text>

        <View style={styles.chartContainer}>
          <View style={styles.chartWrapper}>
            <Text style={styles.yAxisLabel}>Score</Text>
            <View style={{ flex: 1 }}>
              <LineChart
                data={chartData}
                width={screenWidth - 60}
                height={220}
                chartConfig={chartConfig}
                bezier
                fromZero
                segments={2}
                style={{
                  borderRadius: 16,
                  marginLeft: 10,
                }}
              />
              <Text style={styles.xAxisLabel}>Attempt Number</Text>
            </View>
          </View>
          {improvementText !== '' && (
            <Text style={styles.improvementText}>{improvementText}</Text>
          )}
        </View>

        {scores.map((score, index) => (
          <View key={index} style={styles.scoreDetails}>
            <Text style={styles.detailText}>
              Attempt {score.attempt}:{' '}
              {score.score === 2 ? '✅ Both Correct' : score.score === 1 ? '⚠️ One Correct' : '❌ Both Wrong'}
            </Text>
            <Text style={styles.detailSubText}>
              Time: {new Date(score.timestamp).toLocaleString()}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserPerformanceScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
    color: '#4B0082',
  },
  chartContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  scoreDetails: {
    marginTop: 15,
    backgroundColor: '#f9f9ff',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    maxWidth: 600,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  detailText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  detailSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingLeft: 10, 
  },
  yAxisLabel: {
    transform: [{ rotate: '-90deg' }],
    position: 'absolute',
    left: -5,
    top: 100,
    fontSize: 14,
    color: '#4B0082',
    fontWeight: '500',
  },
  xAxisLabel: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#4B0082',
    fontWeight: '500',
  },
  improvementText: {
    fontSize: 16,
    color: '#4B0082',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    fontWeight: '600',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  noDataText: {
    fontSize: 20,
    color: '#4B0082',
    fontWeight: 'bold',
  },
});
