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
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from './routes';
import { withAuthenticator } from 'aws-amplify-react';
import '@aws-amplify/ui/dist/style.css';
import { makeStyles } from '@material-ui/core/styles';
import unicorn from './images/unicorn.png'

function App() {

  const classes = useStyles();

  return (
        <div className={classes.mainContainer}>
          <Router>
            <Routes />
          </Router>
        </div>
  );
};

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    background: `url(${unicorn})`,
    backgroundRepeat: 'repeat-x repeat-y',
    backgroundSize: "32px",
  }
}));

const signUpConfig = {
  header: 'Sign up @ UnicornPics',
  hideAllDefaults: true,
  defaultCountryCode: '44',
  signUpFields: [
    {
      label: 'Username',
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

export default withAuthenticator(App, false, undefined, undefined, undefined, signUpConfig);
