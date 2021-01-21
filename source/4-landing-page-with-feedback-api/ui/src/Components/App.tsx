import {useState} from 'react';
import Input from "./Input";
import Button from "@material-ui/core/Button";
import FormLabel from '@material-ui/core/FormLabel';
import { makeStyles } from "@material-ui/core/styles";
import Header from "./Header";
import SubmissionResult from "./SubmissionResult";
import { submitForm } from "../services";

  const useStyles = makeStyles({
    form: {
      paddingTop: 50,
      width: 300,
      margin: "0 auto"
    },
    button: {
      width: "100%"
    },
    field: {
      paddingBottom: 15
    }
  });

  function App() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [details, setDetails] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [failed, setFailed] = useState(false);
    const classes = useStyles();

    function onFail() {
      setLoading(false);
      setFailed(true);
    }

    function onClickButton() {
        setLoading(true);
        submitForm({ name, email, subject, details })
          .then(response => {
            if (response.status !== 200) {
              onFail()
              return;
            }
            setLoading(false);
            setSubmitted(true);
          })
          .catch(err => {
            onFail();
          });
    }

    return (
      <div>
        <Header />
        {failed ? <SubmissionResult variant="error" open={failed} onClose={()=>setFailed(false)} /> : null}
        {submitted ? <SubmissionResult variant="success" open={submitted} onClose={()=>setSubmitted(false)} /> : null}
        <div className={classes.form}>
          <div className={classes.field}><FormLabel>Any feedback or comments ?</FormLabel></div>
          <Input className={classes.field} label="Name" onChange={setName} />
          <Input className={classes.field} label="Email" onChange={setEmail} />
          <Input className={classes.field} label="Subject" onChange={setSubject} />
          <Input className={classes.field} label="Details" onChange={setDetails} multiline />
          <Button 
            className={classes.button} 
            color="primary" 
            variant="contained" 
            onClick={onClickButton}
            disabled={loading}
          >
            SUBMIT
          </Button>
        </div>
      </div>
    );
  }

  export default App;