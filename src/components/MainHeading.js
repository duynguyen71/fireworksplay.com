import React from "react";
import { Text } from "@chakra-ui/react";

const MainHeading = ({
  text,
  fontSize = [45, 55, 75, 80],
  display = "inline-block",
  className = "newsreader-bold600",
}) => {
  return (
    <Text display={display} fontSize={fontSize} className={className}>
      {text}
    </Text>
  );
};

export default MainHeading;
