import { Box, Heading, Text, Stack, HStack, VStack, Icon, Link, Button, Spinner, Alert, AlertIcon } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { CheckCircleIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { fetchReleases } from "../utils/databaseService";
import authService from "../utils/authService";

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
    boxShadow="none"
    border="1px solid"
    borderColor="line"
    borderRadius="lg"
    p={6}
    my={6}
    transition="all 0.3s"
    _hover={{ borderColor: "gray.300" }}
    bg="surface"
  >
    <Heading
      letterSpacing="wide"
      color="foreground"
      fontSize="xl"
      borderBottom="1px solid"
      borderColor="line"
      pb={2}
      mb={4}
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
              <Text color="muted" fontSize="md">
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
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [user] = useState(authService.getUser());
  const itemsPerPage = 5;
  const totalPages = Math.ceil(releases.length / itemsPerPage);

  const currentItems = releases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const loadReleases = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Load database releases only (all data has been migrated)
      const data = await fetchReleases(1, 100, !forceRefresh);
      const databaseReleases = data.releases || data;

      // Sort by version number (newest first) - improved version parsing
      databaseReleases.sort((a, b) => {
        // Extract version numbers properly (e.g., "2025.10.1" from "Version 2025.10.1")
        const extractVersion = (versionString) => {
          // Handle special cases first
          if (versionString.includes('upcoming')) return '9999.99.99'; // Put upcoming at the top
          if (versionString.includes('Version 3.')) return '0003.00.00'; // Very old versions
          if (versionString.includes('Version 2.')) return '0002.00.00';
          if (versionString.includes('Version 1.')) return '0001.00.00';

          // Extract standard version numbers
          const match = versionString.match(/(\d{4}\.\d{1,2}\.\d{1,2})/);
          return match ? match[1] : versionString;
        };

        const aVersion = extractVersion(a.version);
        const bVersion = extractVersion(b.version);

        // Compare versions numerically (newest first)
        return bVersion.localeCompare(aVersion, undefined, { numeric: true });
      });

      setReleases(databaseReleases);

    } catch (err) {
      console.error('Error loading releases:', err);
      setError('Failed to load release notes from database. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadReleases(true);
  };

  useEffect(() => {
    loadReleases();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      requestAnimationFrame(() => {
        document.getElementById("main-content")?.scrollIntoView({ block: "start" });
      });
    }
  };

  if (loading) {
    return (
      <Box as="main" id="main-content" maxW="1056px" mx="auto" px={4} py={8} display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Heading as="h1" size="xl" color="foreground">
            Release Notes
          </Heading>
          <Spinner size="xl" color="foreground" />
          <Text>Loading release notes...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box as="main" id="main-content" maxW="1056px" mx="auto" px={4} py={8}>
        <Heading as="h1" size="xl" color="foreground" mb={4}>
          Release Notes
        </Heading>
        <Alert status="error" borderRadius="lg" mb={4}>
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text>{error}</Text>
            <Text fontSize="sm" color="muted">
              You can try refreshing the data or reloading the page.
            </Text>
          </VStack>
        </Alert>
        <HStack justify="center" spacing={4}>
          <Button onClick={handleRefresh} isLoading={refreshing} colorScheme="blue">
            Refresh Data
          </Button>
          <Button onClick={() => window.location.reload()} colorScheme="gray" variant="outline">
            Reload Page
          </Button>
        </HStack>
      </Box>
    );
  }

  if (releases.length === 0) {
    return (
      <Box as="main" id="main-content" maxW="1056px" mx="auto" px={4} py={8}>
        <Heading as="h1" size="xl" color="foreground" mb={4}>
          Release Notes
        </Heading>
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">No Release Notes Found</Text>
            <Text>No release notes are available in the database yet.</Text>
            <Button
              as={RouterLink}
              to="/release-note-dashboard"
              colorScheme="blue"
              size="sm"
              mt={2}
            >
              Manage Dashboard
            </Button>
          </VStack>
        </Alert>
      </Box>
    );
  }

  return (
    <Box as="main" id="main-content" maxW="1056px" mx="auto" px={4} py={8}>
      <HStack justify="space-between" mb={4}>
        <Heading as="h1" size="xl" color="foreground">
          Release Notes
        </Heading>
        {user && (
          <Button
            as={RouterLink}
            to="/release-note-dashboard"
            colorScheme="blue"
            variant="outline"
          >
            Manage Dashboard
          </Button>
        )}
      </HStack>

      <div>
        <div key={currentPage}>
          {currentItems.map((update, index) => (
            <ReleaseVersionContainer
              key={update.id || index}
              title={update.version}
              listItem={update.changes}
            />
          ))}
        </div>
      </div>

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
