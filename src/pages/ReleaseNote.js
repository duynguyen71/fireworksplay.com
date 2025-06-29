import { Box, Heading, Text, Stack, Icon, Link, Button, HStack } from "@chakra-ui/react";
import { CheckCircleIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import allUpdates from "../data/updates";

const isVideoLink = (text) => {
  if (typeof text !== "string") return false;
  return (
    text.startsWith("http") &&
    (text.includes("youtube.com") ||
      text.includes("youtu.be") ||
      text.includes("vimeo.com") ||
      text.includes("drive.google.com"))
  );
};

const formatText = (text) => {
  if (!text.includes(":")) return text;

  const [boldPart, ...rest] = text.split(":");
  return (
    <>
      <Text as="span" fontWeight="bold">
        {boldPart}:
      </Text>
      {rest.join(":")}
    </>
  );
};

const ReleaseVersionContainer = ({ title, listItem = [] }) => (
  <Box
    boxShadow="lg"
    border="1px solid"
    borderColor="gray.200"
    borderRadius="lg"
    p={6}
    my={6}
    transition="all 0.3s"
    _hover={{ boxShadow: "xl", transform: "translateY(-2px)" }}
    bg="white"
  >
    <Heading
      mb={4}
      letterSpacing="wide"
      color="red.500"
      fontSize="xl"
      borderBottom="2px solid"
      borderColor="red.300"
      pb={2}
    >
      {title}
    </Heading>

    <Stack spacing={2}>
      {listItem
        .filter((item) => item !== undefined && item !== null)
        .map((item, index) => (
          <Box key={index} display="flex" alignItems="start">
            <Icon as={CheckCircleIcon} color="green.400" mt={1} mr={2} />
            {isVideoLink(item) ? (
              <Button
                as={Link}
                href={item}
                target="_blank"
                rel="noreferrer"
                leftIcon={<ExternalLinkIcon />}
                colorScheme="blue"
                size="sm"
                variant="outline"
              >
                Watch Video
              </Button>
            ) : (
              <Text color="gray.700" fontSize="md">
                {formatText(item)}
              </Text>
            )}
          </Box>
        ))}
    </Stack>
  </Box>
);

const ReleaseNote = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(null);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(allUpdates.length / itemsPerPage);

  const currentItems = allUpdates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage, newDirection = null) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setDirection(newDirection);
      setCurrentPage(newPage);
    }
  };

  return (
    <Box maxW="900px" mx="auto" px={4} py={8}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={direction ? { opacity: 0, y: direction === "next" ? 30 : -30 } : false}
          animate={direction ? { opacity: 1, y: 0 } : false}
          exit={direction ? { opacity: 0, y: direction === "next" ? -30 : 30 } : false}
          transition={direction ? { duration: 0.3 } : {}}
        >
          {currentItems.map((update, index) => (
            <ReleaseVersionContainer
              key={index}
              title={update.version}
              listItem={update.changes}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
        <Button
          onClick={() => handlePageChange(currentPage - 1, "prev")}
          isDisabled={currentPage === 1}
          colorScheme="gray"
          variant="outline"
        >
          Previous
        </Button>

        <Text>
          Page {currentPage} / {totalPages}
        </Text>

        <Button
          onClick={() => handlePageChange(currentPage + 1, "next")}
          isDisabled={currentPage === totalPages}
          colorScheme="gray"
          variant="outline"
        >
          Next
        </Button>
      </Box>

      <HStack justify="center" mt={3}>
        {Array.from({ length: totalPages }).map((_, idx) => (
          <Box
            key={idx}
            w={3}
            h={3}
            borderRadius="full"
            bg={currentPage === idx + 1 ? "blue.500" : "gray.300"}
            cursor="pointer"
            onClick={() => handlePageChange(idx + 1)}
            transition="background-color 0.2s"
          />
        ))}
      </HStack>
    </Box>
  );
};

export default ReleaseNote;
