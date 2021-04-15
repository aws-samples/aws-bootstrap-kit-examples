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

import { Button, Card, CardActions, CardContent, makeStyles, Typography } from "@material-ui/core"
import { useState } from "react";
import Api from "../Api";
import likeBlue from '../images/like-blue.png'
import likeDark from '../images/like-dark.png'
import { PostItem } from "../Types";

const Item = (props: PostItem) => {

    const classes = useStyles();

    const [itemLikes, setItemLikes] = useState(props.likes);
    const [liked, setLiked] = useState(props.liked);

    const likeDislike = async () => {

        setLiked(!liked);

        if(!liked) {
            setItemLikes(await Api.likeItem(props.postId, props.userId));   
        } else {
            setItemLikes(await Api.dislikeItem(props.postId, props.userId));   
        }
        
    };

    return (
        <Card className={classes.itemCard}>
            <CardContent>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                    {props.ownerName}
                </Typography>
                <img src={props.mediaUrl} className={classes.media} alt="unicorn pic"></img>
                <CardActions className={classes.cardActionsItem}>
                        <div className={classes.cardActionsLike}>
                            <Button size="small" onClick={likeDislike}>
                                <img src={liked ? likeBlue : likeDark} className={classes.likeButton} alt="click to like or unlike"></img>
                            Like
                            </Button>
                        </div>
                        <div className={classes.cardActionsLikes}>
                            {itemLikes} likes
                        </div>
                </CardActions>
            </CardContent>
        </Card>
    );
};

const useStyles = makeStyles((theme) => ({
    itemCard: {
        marginBottom: 40
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    media: {
        display: 'block',
        height: 300,
        flex: 1,
        marginLeft: 'auto',
        marginRight: 'auto'
    },
    likeButton: {
                width: 30,
        height: 30
    },
    cardActionsItem: {
        paddingTop: 20,
        paddingBottom: 0,
        marginBottom: 0
    },
    cardActionsLike: {
        textAlign: 'left',
        width: '50%'
    },
    cardActionsLikes: {
        textAlign: 'right',
        width: '50%'
    },
}));

export default Item;