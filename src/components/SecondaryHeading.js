import React from "react";
import { Text } from "@chakra-ui/react";

const SecondaryHeading = ({
  text,
  fontSize = [45, 55, 75, 80],
  display = "inline-block",
  opacity,
  className = "newsreader-bold600",
  ...other
}) => {
  return (
    <Text
      cursor={"default"}
      style={other}
      opacity={opacity}
      display={display}
      fontSize={fontSize}
      className={className}
    >
      {text}
    </Text>
  );
};

export default SecondaryHeading;
