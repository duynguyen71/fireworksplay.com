import { Box, Container } from "@chakra-ui/react";
import React from "react";

const MainPage = () => {
  return (
    <Box minH={"200vh"} textAlign={"center"} margin={"auto"}>
      <Box marginTop={"300px"}>
        <p
          style={{
            fontSize: 85,
          }}
          className="newsreader-bold600"
        >
          Fireworks Play.
        </p>
      </Box>
    </Box>
  );
};

export default MainPage;
