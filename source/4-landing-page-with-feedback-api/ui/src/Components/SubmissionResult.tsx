import React from "react";
import MuiSnackbar from "@material-ui/core/Snackbar";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

interface SubmissionResultProps {
  open: boolean;
  onClose: () => void;
  variant: "success"|"error";
}

export default function SubmissionResult(props: SubmissionResultProps) {
  return (
    <MuiSnackbar open={props.open} autoHideDuration={2000} onClose={props.onClose}>
      <Alert onClose={props.onClose} severity={props.variant}>
        {props.variant === "success" ? "Form submitted!" : "Submission Failed."}
      </Alert>
    </MuiSnackbar>
  )
}