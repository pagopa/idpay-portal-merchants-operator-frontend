import { Card, CardContent, List, ListItem, Typography } from "@mui/material";
import { theme } from "@pagopa/mui-italia";

const DetailsCard = ({
  title,
  item,
}: {
  title: string;
  item: Record<string, string | number>;
}) => {
  const listItems = Object.entries(item);

  return (
    <Card
      sx={{
        height: "fit-content",
        width: "100%",
        backgroundColor: theme.palette.background.paper,
        borderRadius: "4px",
      }}
    >
      <CardContent
        sx={{ display: "flex", flexDirection: "column", rowGap: "1rem" }}
      >
        <Typography variant="h6" fontWeight="fontWeightBold">
          {title}
        </Typography>
        <List
          sx={{ display: "flex", flexDirection: "column", rowGap: "0.5rem" }}
          disablePadding
        >
          {listItems.map(([key, value], index) => {
            return (
              <ListItem
                disablePadding
                sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)" }}
                key={index}
              >
                <Typography variant="body2">{key}</Typography>
                <Typography variant="body2" fontWeight="fontWeightMedium">
                  {value}
                </Typography>
              </ListItem>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};

export default DetailsCard;
