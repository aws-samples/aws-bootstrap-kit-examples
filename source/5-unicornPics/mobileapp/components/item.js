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

import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image
} from 'react-native';
import Colors from '../Colors';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Api from '../Api';

const Item = (props) => {

    const [itemLikes, setItemLikes] = useState(props.likes);
    const [liked, setLiked] = useState(props.liked);

    const likeDislike = async () => {

        setLiked(liked === "true" ? "false" : "true");

        if(liked !== "true") {
            setItemLikes(await Api.likeItem(props.postId, props.userId));   
        } else {
            setItemLikes(await Api.dislikeItem(props.postId, props.userId));   
        }
        
    };

    return (
            <View style={styles.itemWrapper}>
                <View style={styles.itemHeader}>
                    <Text style={styles.usernameText}>{props.username} </Text>
                </View>
                <Image style={styles.itemImage} source={{uri: props.mediaURL }}></Image>
                <TouchableOpacity onPress={likeDislike}> 
                    <View style={styles.itemFooter}>
                        { liked!=="true" && <Image style={{width: 30, height: 30}} source={ require("../images/like-dark.png") }></Image> }
                        { liked=="true" && <Image style={{width: 30, height: 30}} source={ require("../images/like-blue.png")}></Image> }
                        <Text style={styles.likeText}>Like</Text>
                        <Text style={styles.likesText}>{itemLikes} likes</Text>
                    </View>
                </TouchableOpacity>
            </View>        
    );
};

const styles = StyleSheet.create({
    itemWrapper: {
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: Colors.white,
        borderRadius: 10
    },
    itemHeader: {
        height: 40,
        flexDirection: "row",
        marginTop: 0
    },
    itemImage: {
        height: 300,
        flex: 1
    },
    itemFooter: {
        height: 30,
        flex: 1,
        flexDirection: "row",
        alignContent: "center",
        marginTop: 2,
        marginBottom: 2,
        marginLeft: 10,
        marginRight: 10,
    },
    avatar: {
        width: 40, 
        height: 40,
        borderRadius: 25
    },
    usernameText: {
        marginLeft: 10,
        fontSize: 20,
        alignSelf: "center"
    },
    likeText: {
        alignSelf: "center",
        flex: 1
    },
    likesText: {
        fontStyle: "italic",
        flex: 7,
        alignSelf: "center",
        textAlign: "right"
    },
    video: {
        flex:1
    }
});

export default Item;