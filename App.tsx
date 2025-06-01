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

/*ting */
const Stack = createStackNavigator();

const App = () => (
    <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ headerShown: false }}
            />
            <Stack.Screen name="SignUp" component={SignupScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Categories" component={CategoriesScreen} />
            <Stack.Screen name="Trivia" component={TriviaScreen} />
            <Stack.Screen name="AnswerScreen" component={AnswerScreen} />
            <Stack.Screen name="RandomQuestionsScreen" component={RandomQuestionsScreen} />
        </Stack.Navigator>
    </NavigationContainer>
);

export default App;
