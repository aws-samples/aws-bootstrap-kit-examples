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
import { Auth } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    StatusBar
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import Api from '../Api';
import Colors from '../Colors';
import Item from '../components/item';
import ProfileHeader from '../components/profileheader';

const Profile = () => {

    const [items, setItems] = useState([]);
    const [username, setUsername] = useState([]);

    const fetchProfileItemsFromAPI = async () => {
        const itemsFetched = await Api.fetchItemsProfile();
        setItems(itemsFetched);
    }

    const retrieveUsername = async () => {
        // Could be stored in a state somewhere rather than be called everytime
        const username = (await (await Auth.currentSession()).getIdToken()).payload.name;
        setUsername(username);
    }

    useEffect(() => {
        fetchProfileItemsFromAPI();
        retrieveUsername();
    }, []);

    return (
        <>
            <StatusBar barStyle="dark-content" />
            <ScrollView style={styles.mainView}>
                <LinearGradient colors={[Colors.gradientLow, Colors.gradientHigh]} style={styles.gradient}>
                    <ProfileHeader username={username}></ProfileHeader>
                    {
                        items ? 
                        items.map((item) =>
                        <Item key={item.postId}
                            postId={item.postId}
                            userId={item.userId}
                            username={item.ownerName}
                            usernameAvatarURL={item.avatarUrl}
                            mediaURL={item.mediaUrl}
                            likes={item.likes}
                            liked="false"
                        />
                        ) : ""
                    }    
                </LinearGradient>
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({

});

export default Profile;
