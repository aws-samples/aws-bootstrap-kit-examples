import React from "react";
import TextField from "@material-ui/core/TextField";

interface InputProps {
  label: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  className?: string;
}

export default function Input(props: InputProps) {
  return (
    <div className={props.className}>
      <TextField
        variant="outlined"
        label={props.label}
        onChange={e => props.onChange(e.target.value)}
        rows={(props.multiline && 5) || undefined}
        multiline={props.multiline || false}
        fullWidth
      />
    </div>
  );
}