/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License").
You may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './pages/Home';
import Profile from './pages/Profile';
import CameraPage from './pages/Camera';
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';
import { withAuthenticator } from 'aws-amplify-react-native';
Amplify.configure(awsconfig);

const Stack = createStackNavigator();

const App: () => React$Node = ({ navigation }) => {

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="HomePage"
                    component={Home}
                    options={{ title: 'Unicorn feed' }}
                />
                <Stack.Screen
                    name="ProfilePage"
                    component={Profile}
                    options={{ title: 'Unicorn Profile' }}
                />
                <Stack.Screen
                    name="CameraPage"
                    component={CameraPage}
                    options={{ title: 'Take photo of unicorn' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const signUpConfig = {
    header: 'Sign up @ UnicornPics',
    hideAllDefaults: true,
    defaultCountryCode: '44',
    signUpFields: [
        {
            label: 'Name',
            key: 'name',
            required: true,
            displayOrder: 1,
            type: 'string'
        },
        {
            label: 'Email',
            key: 'email',
            required: true,
            displayOrder: 2,
            type: 'string'
        },
        {
            label: 'Password',
            key: 'password',
            required: true,
            displayOrder: 3,
            type: 'password'
        }
    ]
};

export default withAuthenticator(App, { usernameAttributes: 'Name', signUpConfig});
