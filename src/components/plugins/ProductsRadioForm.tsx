import { ReactElement, ChangeEvent, Dispatch, SetStateAction } from "react";
import { makeStyles, RadioGroup, FormControl } from "@material-ui/core";
import { FormLabelControl } from "./FormLabelControl";
import { IPlugin, Product } from "@/interfaces";

const useStyles = makeStyles({
  marginTop: { marginTop: "15px" },
  textFontSize: { fontSize: "16px" },
  productRadioName: { fontSize: "16px", lineHeight: 0, fontWeight: 400 },
});

interface Props {
  newPlugin: IPlugin;
  setNewPlugin: Dispatch<SetStateAction<IPlugin>>;
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
        setNewPlugin((p) => ({ ...p, products: e.target.value } as IPlugin));
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
