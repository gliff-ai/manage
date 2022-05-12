import { ReactElement, ChangeEventHandler } from "react";
import { Box, TextField } from "@mui/material";

interface Props {
  value: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  maxCharacters?: number; // max number of characters in the string
  rows?: number;
  maxRows?: number;
  placeholder?: string;
}

export const Notepad = (props: Props): ReactElement => (
  <Box
    sx={{
      "& .MuiOutlinedInput-root": { height: "unset" },
    }}
    component="form"
    autoComplete="off"
  >
    <TextField
      placeholder={props.placeholder}
      type="string"
      inputProps={{
        maxLength: props.maxCharacters,
      }}
      multiline
      rows={props.rows}
      maxRows={props.maxRows}
      margin="none" // remove any margin added by default
      value={props.value}
      onChange={props.onChange}
      variant="outlined"
    />
  </Box>
);

Notepad.defaultProps = {
  maxCharacters: 250,
  rows: undefined,
  maxRows: undefined,
  placeholder: undefined,
};
