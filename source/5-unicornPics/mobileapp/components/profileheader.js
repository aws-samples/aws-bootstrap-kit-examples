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

import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image
} from 'react-native';
import Colors from '../Colors';

const ProfileHeader = (props) => {

    return (
        <View style={styles.profileHeaderWrapper}>
            <Image style={styles.avatarLarge} source={require('../images/unicorn.png')}></Image>
            <Text style={styles.profileHeaderText}>{props.username}</Text>
        </View>          
    );
};

const styles = StyleSheet.create({
    avatarLarge: {
        width: 150, 
        height: 150
    },
    profileHeaderWrapper: {
        height: 250,
        justifyContent: 'center',
        alignItems: 'center'
    },
    profileHeaderText: {
        fontSize: 48,
        alignSelf: 'center',
        color: Colors.white
    }
});

export default ProfileHeader;