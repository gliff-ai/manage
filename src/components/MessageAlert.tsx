import { ReactElement } from "react";
import { Alert } from '@mui/material';

interface MessageProps {
  message: string;
  severity: "info" | "warning" | "error" | "success";
}

function MessageAlert({
  message,
  severity,
}: MessageProps): ReactElement | null {
  return message ? <Alert severity={severity}>{message}</Alert> : null;
}

export { MessageAlert };
