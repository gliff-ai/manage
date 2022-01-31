import { ReactElement, ChangeEvent } from "react";
import {
  Avatar,
  Checkbox,
  FormControlLabel,
  List,
  TextField,
  Chip,
  makeStyles,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import SVG from "react-inlinesvg";
import { theme, icons } from "@gliff-ai/style";
import { Project } from "@/interfaces";

const useStyles = makeStyles({
  marginTop: { marginTop: "15px" },
  option: {
    backgroundColor: `#FFFFFF !important`,
    fontSize: "16px",
    "&:hover": { backgroundColor: `${theme.palette.grey[100]} !important` },
  },
  checkboxIcon: { width: "18px", height: "auto" },
  chipLabel: {
    margin: "5px 5px 0 0",
    borderColor: "black",
    borderRadius: "9px",
  },
  closeIcon: { width: "15px", height: "auto" },
});

interface Props {
  allProjects: Project[];
  currentProjects: Project[];
  setProjects: (newProjects: Project[]) => void;
}

export const ProjectsAutocomplete = ({
  allProjects,
  currentProjects,
  setProjects,
}: Props): ReactElement => {
  const classes = useStyles();

  return (
    <>
      {/* eslint-disable react/jsx-props-no-spreading */}
      <Autocomplete
        className={classes.marginTop}
        classes={{ option: classes.option }}
        multiple
        disableCloseOnSelect
        disableClearable
        value={currentProjects}
        onChange={(e: ChangeEvent<HTMLSelectElement>, value: Project[]) => {
          setProjects(value);
        }}
        renderTags={(option) => null}
        options={allProjects}
        getOptionLabel={(option) => option.name}
        renderOption={(option) => (
          <FormControlLabel
            label={option.name}
            control={
              <Checkbox
                style={{ padding: "10px" }}
                icon={<div className={classes.checkboxIcon} />}
                checkedIcon={
                  <SVG
                    className={classes.checkboxIcon}
                    src={icons.multipleImageSelection}
                  />
                }
                checked={currentProjects.includes(option)}
              />
            }
          />
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Add Plug-in to Projects"
          />
        )}
      />
      <List>
        {currentProjects?.map((project) => (
          <Chip
            variant="outlined"
            key={project.name}
            className={classes.chipLabel}
            label={project.name}
            avatar={
              <Avatar
                variant="circular"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setProjects(currentProjects.filter((p) => p !== project))
                }
              >
                <SVG
                  fill="inherit"
                  className={classes.closeIcon}
                  src={icons.removeLabel}
                />
              </Avatar>
            }
          />
        ))}
      </List>
    </>
  );
};
