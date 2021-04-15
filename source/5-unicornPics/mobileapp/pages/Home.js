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
import React, { useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Image
} from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { useIsFocused } from "@react-navigation/native";
import Api from '../Api';
import Item from '../components/item';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../Colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Auth } from 'aws-amplify';

const Home = ({navigation}) => {

  const [items, setItems] = useState([]);
  const isVisible = useIsFocused();

  const doNavigate = () => {
    navigation.navigate("ProfilePage");
  };

  const goCamera = () => {
    navigation.navigate("CameraPage");
  }

  const doSignout = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
        console.log('error signing out: ', error);
    }
  }

  const fetchItemsFromAPI = async () => {
    const itemsFetched = await Api.fetchItems();
    setItems(itemsFetched);
  }

  useLayoutEffect(() => {

    if (isVisible) {
      console.log("called when screen open or when back on screen "); 
  
      fetchItemsFromAPI();

      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={doNavigate}>
            <Image
              source={require('../images/unicorn.png')}
              style={{ width: 40, height: 40, marginRight : 15 }} />
          </TouchableOpacity>        
        ),
        headerLeft: () => (
          <TouchableOpacity onPress={doSignout}>
            <Icon name={'exit-to-app'} color={Colors.black} size={32} />
          </TouchableOpacity>        
        ),
      });
    }
  }, [navigation, isVisible]);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.mainView}>
        <LinearGradient colors={[Colors.gradientLow, Colors.gradientHigh]} style={styles.gradient}>
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

      <View style={styles.newButtonWrapper}>
        <TouchableOpacity onPress={goCamera}>
          <Image style={styles.newButton} source={require('../images/camera.png')}/>
        </TouchableOpacity>        
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  newButtonWrapper : {
    position: 'absolute',
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    marginRight: 20,
    marginBottom: 20,
    backgroundColor: 'red',
    width: 78,
    height: 78,
    alignItems: 'center',
    borderRadius: 50
  },
  newButton: {
    width: 48,
    height: 48,
    marginBottom: 2
  },
  logoView: {
    flex: 5,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center'
  }
});

export default Home;