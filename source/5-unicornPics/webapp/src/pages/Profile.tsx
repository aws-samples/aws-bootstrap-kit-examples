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
import { AppBar, Container, Toolbar, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Api from '../Api';
import Item from '../components/Item';
import profile from '../images/profile.png';
import { Auth } from 'aws-amplify';
import { PostItem } from '../Types';

const Profile = () => {

    const classes = useStyles();
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
        <Container maxWidth={false} className={classes.mainContainer}>
            <AppBar position="sticky">
                <Toolbar>
                    <Link to="/">
                        <Typography variant="h6" className={classes.title}>
                            Back to home page
                        </Typography>
                    </Link>
                </Toolbar>
            </AppBar>
            <Container maxWidth="md" className={classes.itemContainer}>
                <img src={profile} className={classes.profileHeader} alt="your avatar"></img>
                <div className={classes.usernameTitle}>{username}</div>
                <div>
                    {
                        items ?
                            items.map((item: PostItem) =>
                                <Item key={item.postId}
                                    postId={item.postId}
                                    userId={item.userId}
                                    ownerName={item.ownerName}
                                    avatarUrl={item.avatarUrl}
                                    mediaUrl={item.mediaUrl}
                                    likes={item.likes}
                                    liked={false}
                                />
                            ) : ""
                    }
                </div>
            </Container>
        </Container>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1
    },
    mainContainer: {
        paddingLeft: 0,
        paddingRight: 0,
        background: 'linear-gradient(0deg, rgba(200,200,200,1) 0%, rgba(255,255,255,1) 100%)',
        minHeight: '100vh'
    },
    profileHeader: {
        display: 'block',
        maxWidth: 256,
        minWidth: 128,
        marginLeft: 'auto',
        marginRight: 'auto'
    },
    itemContainer: {
        paddingBottom: 20
    },
    usernameTitle: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30
    }
}));

export default Profile;