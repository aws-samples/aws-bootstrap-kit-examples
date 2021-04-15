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

import { AppBar, Button, CircularProgress, Container, Fab, Modal, Toolbar, Typography } from '@material-ui/core'
import unicorn from '../images/unicorn.png'
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import Item from '../components/Item';
import { useLayoutEffect, useRef, useState } from 'react';
import Api from '../Api';
import AddIcon from '@material-ui/icons/Add'
import ReplayIcon from '@material-ui/icons/Replay';
import { PostItem } from '../Types';

const Home = () => {

    const classes = useStyles();
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    var inputFile = useRef<HTMLInputElement>(null) 

    const fetchItemsFromAPI = async () => {

        const itemsFetched = await Api.fetchItems();
        setItems(itemsFetched);

        console.log(itemsFetched);
    }

    useLayoutEffect(() => {

        fetchItemsFromAPI();

    }, []);

    const upload = () => {
        inputFile.current!.click();
    };

    const onChangeFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        
        setMessage("Uploading image");
        setLoading(true);
        setOpen(true);
        
        var file = event.target!.files![0];
        
        const resp = await Api.uploadFile(file);

        setLoading(false);
        setMessage(resp === 1 ? "Image uploaded " : "error occured");

        event.target.value = "";
    }

    const handleClose = () => {

        fetchItemsFromAPI();
        setOpen(false);
    };

    

    return (
        <Container maxWidth={false} className={classes.mainContainer}>
            <AppBar position="sticky">
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        Unicorn pics
            </Typography>
                    <Link to="/profile">
                        <Button color="inherit">
                            <img src={unicorn} alt="My Profile" width="48" />
                        </Button>
                    </Link>
                </Toolbar>
            </AppBar>
            <Container maxWidth="md" className={classes.itemContainer}>
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
                    {
                        !items.length ? <div className={classes.firstMessage}>No unicorn pic found! <br></br>Upload one with the + button <br></br>or try <button onClick={fetchItemsFromAPI}><ReplayIcon></ReplayIcon> </button></div> : ""
                    }
                </div>
            </Container>
            <Fab color="secondary" aria-label="add" className={classes.addButton} onClick={upload}>
                <AddIcon fontSize="large"/>
            </Fab>
            <input type='file' id='file' ref={inputFile} style={{display: 'none'}} onChange={onChangeFile.bind(this)}/>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                >
                <div className={classes.insideModal}>
                    { loading && <CircularProgress color="secondary" /> }
                    <p>{message}</p>
                    { !loading && <button onClick={handleClose}>Close</button>}
                </div>
            </Modal>
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
        flexGrow: 1,
    },
    mainContainer: {
        paddingLeft: 0,
        paddingRight: 0,
        minHeight: '100vh'
    },
    itemContainer: {
        paddingBottom: 20,
        paddingTop: 20
    },
    addButton: {
        right: 10,
        bottom: 10,
        position: 'fixed',
        width: 90,
        height: 90
    },
    insideModal: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 128,
        height: 100,
        transform: `translate(-50%, -50%)`,
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(2, 4, 3),
        textAlign: 'center'
    },
    firstMessage: {
        color: "grey",
        shadow: "5px grey",
        fontWeight: "bold",
        fontSize: "36px",
        textAlign: "center",
        background: "white",
        border: "1px solid pink"
    }
}));

export default Home;