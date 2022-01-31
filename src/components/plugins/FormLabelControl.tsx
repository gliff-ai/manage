import { ReactElement } from "react";
import { makeStyles, FormControlLabel, Radio } from "@material-ui/core";
import SVG from "react-inlinesvg";
import { theme, icons } from "@gliff-ai/style";

const useStyles = makeStyles({
  formControl: { alignItems: "flex-start" },
  radio: { marginRight: "15px" },
  checkboxIcon: { width: "18px", height: "auto" },
  radioName: { fontSize: "16px", lineHeight: 0 },
  radioDescription: { fontSize: "14px", color: theme.palette.text.hint },
  marginTop: { marginTop: "15px" },
  checkedIcon: {
    fill: "white",
    borderRadius: "3px",
    backgroundColor: theme.palette.primary.main,
  },
});

interface Props {
  value: unknown;
  name: string;
  description?: string | null;
  nameStyling?: string | null;
  descriptionStyling?: string | null;
}
export const FormLabelControl = ({
  value,
  name,
  description,
  nameStyling,
  descriptionStyling,
}: Props): ReactElement => {
  const classes = useStyles();
  return (
    <FormControlLabel
      className={classes.formControl}
      control={
        <Radio
          icon={
            <SVG
              className={classes.checkboxIcon}
              src={icons.notSelectedTickbox}
            />
          }
          checkedIcon={
            <SVG
              className={`${classes.checkboxIcon} ${classes.checkedIcon}`}
              src={icons.multipleImageSelection}
            />
          }
          className={classes.radio}
          value={value}
        />
      }
      label={
        <>
          <h3 className={nameStyling || classes.radioName}>{name}</h3>
          {description && (
            <p className={descriptionStyling || classes.radioDescription}>
              {description}
            </p>
          )}
        </>
      }
    />
  );
};

FormLabelControl.defaultProps = {
  description: null,
  nameStyling: null,
  descriptionStyling: null,
};
