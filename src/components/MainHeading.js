import React from "react";
import { Text } from "@chakra-ui/react";

const MainHeading = ({
  text,
  fontSize = [45, 55, 75, 80],
  display = "inline-block",
  className = "newsreader-bold600",
  color,
  opacity,
  style,
  ...props
}) => {
  return (
    <Text
      color={color}
      cursor={"default"}
      display={display}
      fontSize={fontSize}
      className={className}
      opacity={opacity}
      style={style}
      userSelect="none"
      {...props}
    >
      {text}
    </Text>
  );
};

export default MainHeading;
