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
import { API, Auth } from 'aws-amplify';

const apiName = "MyAPIGatewayAPI";

// API Class centralizing call to cloud services
class Api {

    static async fetchItems()  {

        return await API.get(apiName, "/")
            .catch(error => {
                console.log(error.response);
            });
    }

    static async fetchItemsProfile() {
        const username = (await (await Auth.currentSession()).getIdToken()).payload['cognito:username'];
        
        return await API.get(apiName, "/users/" + username)
            .catch(error => {
                console.log(error.response);
            });
    }

    static async likeItem(post, user) {

        const data = await API.put(apiName, "/like", { 
            body: { user: user, post: post},
        })
        .catch(error => {
            console.log(error.response);
        });

        return data.Attributes.likes;
    }

    static async dislikeItem(post, user) {
        
        const data = await API.put(apiName, "/dislike", { 
            body: { user: user, post: post},
        })
        .catch(error => {
            console.log(error.response);
        });

        return data.Attributes.likes;
    }

    static async preparePost() {

        const username = (await (await Auth.currentSession()).getIdToken()).payload.name;
        
        console.log(username);
        return await API.put(apiName, "/preparepost", {
            body: { user: username }
        })    
        .catch(error => {
            console.log(error.response);
        });
    }

    static async uploadFile(fileURI) {

        console.log("upload post");
        
        // get the presigned url 
        const signedRequestResp = await this.preparePost();
        console.log(signedRequestResp);
        
        // get the photo in a blob - using RN fetch - using RN fetch because URL can be virtually anything
        const resp = await fetch(fileURI).catch(err => console.log(err));
        const imageBody = await resp.blob();

        console.log(signedRequestResp.url);

        // Send the file with due headers for signed request - using RN fetch because URL can be virtually anything
        fetch(signedRequestResp.url, {
            method: "PUT",
            body: imageBody,
            header: {
                'x-amz-meta-userid': signedRequestResp.userid,
                'x-amz-meta-postid': signedRequestResp.postid,
                'x-amz-meta-createdat': signedRequestResp.createdat,
                'x-amz-meta-ownername': signedRequestResp.ownername
            }
        }).then(data => console.log("uploaded"))
        .catch(err => console.log(err));
    }
}

export default Api;