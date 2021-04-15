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
    Image
} from 'react-native';
import Api from '../Api';
import { RNCamera as Camera } from 'react-native-camera';
import { TouchableOpacity } from 'react-native-gesture-handler';

const CameraPage = ({navigation}) => {

    const takePicture = async () => {
        console.log("take photo");
        navigation.navigate("HomePage");
        const options = { quality: 0.5, base64: true };
        const data = await this.camera.takePictureAsync(options);
        console.log(data.uri);
        
        Api.uploadFile(data.uri);
    };

    return (
        <>
            <View style={styles.container}>
                <Camera ref={ref => {this.camera = ref}} captureAudio={false} >  
                </Camera>
            </View>
            <View style={styles.newButtonWrapper}>
                <TouchableOpacity onPress={takePicture}>
                <Image style={styles.newButton} source={require('../images/camera.png')}/>
            </TouchableOpacity>        
        </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    newButtonWrapper : {
        position: 'absolute',
        marginLeft: "35%",
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'center',
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
    }
});

export default CameraPage;
