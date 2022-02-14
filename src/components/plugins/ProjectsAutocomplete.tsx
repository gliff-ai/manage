import { ReactElement, ChangeEvent, Dispatch, SetStateAction } from "react";
import {
  Avatar,
  Checkbox,
  FormControlLabel,
  List,
  TextField,
  Chip,
  Autocomplete,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import SVG from "react-inlinesvg";
import { icons, lightGrey } from "@gliff-ai/style";
import { IPlugin, PluginType, Project } from "@/interfaces";
import { ServiceFunctions } from "@/api";

const useStyles = makeStyles({
  marginTop: { marginTop: "15px" },
  option: {
    fontSize: "16px",
    backgroundColor: `#FFFFFF !important`,
    "&:hover": { backgroundColor: `${lightGrey} !important` },
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
  plugin: IPlugin;
  setPlugin: Dispatch<SetStateAction<IPlugin>>;
  services: ServiceFunctions;
  setError: (error: string) => void;
}

export const ProjectsAutocomplete = ({
  allProjects,
  plugin,
  setPlugin,
  services,
  setError,
}: Props): ReactElement => {
  const classes = useStyles();

  const removeFromPlugin = (projectUid: string) =>
    setPlugin((prevPlugin) => ({
      ...prevPlugin,
      collection_uids: prevPlugin.collection_uids.filter(
        (uid) => uid !== projectUid
      ),
    }));

  const addToPlugin = (projectUid: string) =>
    setPlugin((p) => ({
      ...p,
      collection_uids: [...p.collection_uids, projectUid],
    }));

  const updateProjects = async (
    event: ChangeEvent<HTMLSelectElement>,
    value: Project[]
  ) => {
    const newUids = value.map(({ uid }) => uid);

    if (plugin.type !== PluginType.Javascript) {
      await Promise.all(
        allProjects.map(async ({ uid, name }) => {
          if (!plugin.collection_uids.includes(uid) && newUids.includes(uid)) {
            try {
              await services.inviteToProject({
                projectUid: uid,
                email: plugin.username,
              });
              addToPlugin(uid);
            } catch (e) {
              console.log(e);
              setError(
                `Cannot add ${plugin.name} to ${name}: the invitation is pending.`
              );
            }
          }

          if (plugin?.collection_uids.includes(uid) && !newUids.includes(uid)) {
            try {
              await services.removeFromProject({
                projectUid: uid,
                email: plugin.username,
              });
              removeFromPlugin(uid);
            } catch (e) {
              setError(
                `Cannot remove ${plugin.name} from ${name}: the invitation is pending.`
              );
              console.log(e);
            }
          }
        })
      );
    } else {
      setPlugin((prevPlugin) => ({
        ...prevPlugin,
        collection_uids: newUids,
      }));
    }
  };

  const removeFromProject = async (project: Project) => {
    let canRemove = true;
    if (
      plugin?.type !== PluginType.Javascript &&
      plugin?.username !== undefined
    ) {
      try {
        await services.removeFromProject({
          projectUid: project.uid,
          email: plugin.username,
        });
      } catch (e) {
        canRemove = false;
        setError(
          `Cannot remove ${plugin.name} from ${project.name}: the invitation is pending.`
        );
        console.log(e);
      }
    }
    if (!canRemove) return;
    removeFromPlugin(project.uid);
  };

  return (
    <>
      {/* eslint-disable react/jsx-props-no-spreading */}
      <Autocomplete
        className={classes.marginTop}
        classes={{ option: classes.option }}
        multiple
        disableCloseOnSelect
        disableClearable
        value={allProjects.filter(({ uid }) =>
          plugin.collection_uids.includes(uid)
        )}
        onChange={updateProjects}
        renderTags={() => null}
        options={allProjects}
        getOptionLabel={(option) => option.name}
        renderOption={(props, option) => (
          <li {...props}>
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
                  checked={plugin.collection_uids.includes(option.uid)}
                />
              }
            />
          </li>
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
        {allProjects
          .filter(({ uid }) => plugin.collection_uids.includes(uid))
          ?.map((project) => (
            <Chip
              variant="outlined"
              key={project.name}
              className={classes.chipLabel}
              label={project.name}
              avatar={
                <Avatar
                  variant="circular"
                  style={{ cursor: "pointer" }}
                  onClick={() => removeFromProject(project)}
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
