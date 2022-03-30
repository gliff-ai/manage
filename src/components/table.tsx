import { ReactElement } from "react";
import {
  ButtonGroup,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { lightGrey } from "@gliff-ai/style";

const StyledTableCell = styled(TableCell)({
  fontSize: "16px",
  paddingLeft: "20px",
  margin: 0,
  maxWidth: "unset",
});

const StyledTableRow = styled(TableRow)({
  height: "50px",
  "&:hover": {
    backgroundColor: lightGrey,
  },
  "&:hover td div": {
    visibility: "visible",
    backgroundColor: "transparent !important",
    // TODO: change IconButton backgroundColor from inherit to transparent
  },
});

interface Props {
  header: string[];
  children: JSX.Element | JSX.Element[];
  hasButtonsCell?: boolean;
}

const StyledTable = ({
  header,
  children,
  hasButtonsCell,
}: Props): ReactElement => (
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          {header.map((name) => (
            <StyledTableCell key={name}>{name}</StyledTableCell>
          ))}
          {hasButtonsCell && <StyledTableCell />}
        </TableRow>
      </TableHead>
      <TableBody>{children}</TableBody>
    </Table>
  </TableContainer>
);

StyledTable.defaultProps = {
  hasButtonsCell: true,
};

const TableButtonsCell = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}): ReactElement => {
  const StyledButtonGroup = styled(ButtonGroup)({
    visibility: "hidden",
    float: "right",
    marginRight: "20px",
    backgroundColor: "transparent !important",
    border: "none !important",
  });
  return (
    <TableCell align="right">
      <StyledButtonGroup orientation="horizontal" variant="text" size="medium">
        {children}
      </StyledButtonGroup>
    </TableCell>
  );
};

export {
  StyledTable as Table,
  TableButtonsCell,
  StyledTableCell as TableCell,
  StyledTableRow as TableRow,
};
