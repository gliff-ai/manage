import { ReactElement, ChangeEvent, Dispatch, SetStateAction } from "react";
import { RadioGroup, FormControl } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { FormLabelControl } from "./FormLabelControl";
import { IPluginOut, Product } from "@/interfaces";

const useStyles = makeStyles({
  marginTop: { marginTop: "15px" },
  textFontSize: { fontSize: "16px" },
  productRadioName: { fontSize: "16px", lineHeight: 0, fontWeight: 400 },
});

interface Props {
  newPlugin: IPluginOut;
  setNewPlugin: Dispatch<SetStateAction<IPluginOut>>;
}

export const ProductsRadioForm = ({
  newPlugin,
  setNewPlugin,
}: Props): ReactElement => {
  const classes = useStyles();

  return (
    <FormControl
      className={classes.marginTop}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        setNewPlugin((p) => ({ ...p, products: e.target.value } as IPluginOut));
      }}
    >
      <p className={classes.textFontSize}>Add plugin to:</p>
      <RadioGroup value={newPlugin.products}>
        <FormLabelControl
          value={Product.CURATE}
          name="CURATE plug-in toolbar"
          nameStyling={classes.productRadioName}
        />
        <FormLabelControl
          value={Product.ANNOTATE}
          name="ANNOTATE plug-in toolbar"
          nameStyling={classes.productRadioName}
        />
        <FormLabelControl
          value={Product.ALL}
          name="ALL plug-in toolbars"
          nameStyling={classes.productRadioName}
        />
      </RadioGroup>
    </FormControl>
  );
};
