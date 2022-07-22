import { ReactElement, ChangeEvent, Dispatch, SetStateAction } from "react";
import SVG from "react-inlinesvg";
import {
  icons,
  Avatar,
  Checkbox,
  FormControlLabel,
  List,
  Box,
  TextField,
  Chip,
  Autocomplete,
} from "@gliff-ai/style";
import { IPluginOut, Project } from "@/interfaces";

interface Props {
  allProjects: Project[];
  plugin: IPluginOut;
  setPlugin: Dispatch<SetStateAction<IPluginOut>>;
  pendingProjectInvites?: string[];
}

export const ProjectsAutocomplete = ({
  allProjects,
  plugin,
  setPlugin,
  pendingProjectInvites,
}: Props): ReactElement => {
  const removePluginFromProject = (projectUid: string) =>
    setPlugin((prevPlugin) => ({
      ...prevPlugin,
      collection_uids: prevPlugin.collection_uids.filter(
        (uid) => uid !== projectUid
      ),
    }));

  const updatePluginProjects = (
    event: ChangeEvent<HTMLSelectElement>,
    value: Project[]
  ) =>
    setPlugin((p) => ({
      ...p,
      collection_uids: value.map(({ uid }) => uid),
    }));

  return (
    <>
      {/* eslint-disable react/jsx-props-no-spreading */}
      <Autocomplete
        sx={{ marginTop: "15px" }}
        multiple
        disableCloseOnSelect
        disableClearable
        value={allProjects.filter(({ uid }) =>
          plugin.collection_uids.includes(uid)
        )}
        onChange={updatePluginProjects}
        renderTags={() => null}
        options={allProjects.filter(
          ({ uid }) => !pendingProjectInvites.includes(uid)
        )}
        getOptionLabel={(option: Project) => option.name}
        renderOption={(props, option) => (
          <li {...props}>
            <FormControlLabel
              label={option.name}
              control={
                <Checkbox
                  style={{ padding: "10px" }}
                  icon={<Box sx={{ width: "18px", height: "auto" }} />}
                  checkedIcon={
                    <SVG
                      src={icons.multipleImageSelection}
                      width="18px"
                      height="auto"
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
          .filter(
            ({ uid }) =>
              plugin.collection_uids.includes(uid) &&
              !pendingProjectInvites.includes(uid)
          )
          ?.map((project) => (
            <Chip
              variant="outlined"
              key={project.name}
              sx={{ borderColor: "black" }}
              label={project.name}
              avatar={
                <Avatar
                  variant="circular"
                  style={{ cursor: "pointer" }}
                  onClick={() => removePluginFromProject(project.uid)}
                >
                  <SVG
                    fill="inherit"
                    src={icons.removeLabel}
                    width="15px"
                    height="auto"
                  />
                </Avatar>
              }
            />
          ))}
        {allProjects
          .filter(
            ({ uid }) =>
              plugin.collection_uids.includes(uid) &&
              pendingProjectInvites.includes(uid)
          )
          ?.map((project) => (
            <Chip variant="outlined" key={project.name} label={project.name} />
          ))}
      </List>
    </>
  );
};

ProjectsAutocomplete.defaultProps = {
  pendingProjectInvites: [],
};
