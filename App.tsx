import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SignupScreen from "./screens/SignupScreen";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import CategoriesScreen from  "./screens/CategoriesScreen";
import TriviaScreen from "./screens/TriviaScreen";
import AnswerScreen from "./screens/AnswerScreen";
import RandomQuestionsScreen from "./screens/RandomQuestionsScreen";
import ScoreScreen from "./screens/ScoreScreen";


/*ting */
const Stack = createStackNavigator();

const App = () => (
    <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Categories" component={CategoriesScreen} />
            <Stack.Screen name="Trivia" component={TriviaScreen} />
            <Stack.Screen name="AnswerScreen" component={AnswerScreen} />
            <Stack.Screen name="RandomQuestionsScreen" component={RandomQuestionsScreen} />
            <Stack.Screen name="ScoreScreen" component={ScoreScreen} />



        </Stack.Navigator>
    </NavigationContainer>
);

export default App;
