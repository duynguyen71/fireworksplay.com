import { Box, Heading, Text } from "@chakra-ui/react";
import React from "react";
import allUpdates from '../data/updates';

const ReleaseVersionContainer = ({ index, title, listItem = [] }) => {
  return (
    <Box boxShadow={"md"} m={4} my={8} px={8} py={4} borderRadius={"md"}>
      <Heading
        m={0}
        p={1}
        letterSpacing={1}
        color={"red.400"}
        as={"h1"}
        fontSize={"lg"}
      >
        {title}
      </Heading>
      {listItem.map((item, index) => (
        <Text key={index} fontWeight={"normal"} p={1}>
          {"- "}
          {item}
        </Text>
      ))}
    </Box>
  );
};

const ReleaseNote = () => {
  return (
    <>
      {allUpdates.map((update, index) => (
        <ReleaseVersionContainer
          key={index}
          index={index}
          title={update.version}
          listItem={update.changes}
        />
      ))}
    </>
  );
};

export default ReleaseNote;
