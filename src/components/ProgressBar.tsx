import { ReactElement } from "react";
import { LinearProgress, Typography, Box } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { theme } from "@gliff-ai/style";

const useStyle = makeStyles({
  boxMain: { display: "flex", alignItems: "center" },
  boxProgress: {
    width: "250px",
    mr: 1,
    border: `1.5px solid ${theme.palette.text.secondary}`,
    borderRadius: 3,
  },
  boxCount: { marginLeft: "10px" },
  progressBar: {
    height: "13px",
    borderRadius: 3,
    backgroundColor: theme.palette.primary.light,
  },
});

interface Props {
  progress: { complete: number; total: number } | null;
}

export function ProgressBar({ progress }: Props): ReactElement | null {
  const classes = useStyle();

  if (progress === undefined) return null;

  return progress.total > 0 ? (
    <Box className={classes.boxMain}>
      <Box className={classes.boxProgress}>
        <LinearProgress
          className={classes.progressBar}
          variant="determinate"
          value={(progress.complete / progress.total) * 100}
        />
      </Box>
      <Box className={classes.boxCount}>
        <Typography variant="body2">{`${progress.complete}/${progress.total}`}</Typography>
      </Box>
    </Box>
  ) : (
    <p>No assigned images.</p>
  );
}
