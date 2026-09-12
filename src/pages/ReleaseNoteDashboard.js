import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Input,
  Divider,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  Badge,
  Spinner,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Flex,
  Icon,
  Tag,
  Tooltip,
  useColorModeValue,
  Container,
  useBreakpointValue,
  Hide,
  Stat,
  StatLabel,
  StatNumber,
  List,
  ListItem,
  Progress,
  ScaleFade,
  SlideFade,
  Circle,
} from "@chakra-ui/react";
import {
  EditIcon,
  DeleteIcon,
  AddIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TimeIcon,
  ViewIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
} from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";
import allUpdates from "../data/updates";
import {
  fetchReleases,
  createRelease,
  updateRelease,
  deleteRelease
} from "../utils/databaseService";
import authService from "../utils/authService";
import { parseQuickRelease } from "../utils/quickReleaseParser";

// Clear any existing cache on page load
const clearExistingCache = () => {
  try {
    localStorage.removeItem('fireworksplay_releases_cache');
    console.log('🗑️ Cleared existing release notes cache');
  } catch (error) {
    console.warn('Error clearing cache:', error);
  }
};

const ReleaseNoteDashboard = () => {
  useEffect(() => {
    clearExistingCache();
  }, []);

  const [releases, setReleases] = useState([]);
  const [databaseReleases, setDatabaseReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingFromNotion, setFetchingFromNotion] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [formData, setFormData] = useState({ version: '', changes: [''] });
  const [quickInputText, setQuickInputText] = useState('');
  const [user, setUser] = useState(authService.getUser());
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const totalPages = Math.ceil(databaseReleases.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Responsive breakpoints
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Responsive sizing
  const containerMaxWidth = useBreakpointValue({ base: "100%", md: "container.md", lg: "container.lg", xl: "container.xl" });
  const statsColumns = useBreakpointValue({ base: 1, sm: 2, lg: 3 });
  const modalSize = useBreakpointValue({ base: "full", md: "xl" });
  const headerPadding = useBreakpointValue({ base: 4, sm: 6, md: 8 });
  const contentPadding = useBreakpointValue({ base: 4, sm: 6, md: 8 });

  const toast = useToast({
    position: "top-right",
    duration: 4000,
    isClosable: true,
    variant: "solid",
  });

  // Ref to track if data has been loaded to prevent multiple API calls
  const hasLoadedData = useRef(false);
  const isLoadingData = useRef(false);
  const lastLoadTime = useRef(0);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);

      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
        status: "info",
      });

      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout",
        status: "error",
        duration: 5000,
      });
    }
  };

  const fetchFromDatabase = useCallback(async () => {
    const now = Date.now();

    // Prevent multiple API calls with multiple checks
    if (hasLoadedData.current) {
      console.log('🔄 fetchFromDatabase: Already loaded, skipping API call');
      return;
    }

    if (isLoadingData.current) {
      console.log('🔄 fetchFromDatabase: Currently loading, skipping API call');
      return;
    }

    // Prevent calls within 2 seconds of last call
    if (now - lastLoadTime.current < 2000) {
      console.log('🔄 fetchFromDatabase: Called too quickly, skipping API call');
      return;
    }

    console.log('🔄 fetchFromDatabase: Starting API call');

    hasLoadedData.current = true; // Set immediately to prevent race conditions
    isLoadingData.current = true;
    lastLoadTime.current = now;

    setFetchingFromNotion(true);
    try {
      const data = await fetchReleases(1, 50, false); // Disable cache
      console.log('Fetched data from API:', data);
      let releases = data.releases || data;
      console.log('Releases before sorting:', releases);

      // Map API response to ensure proper ID structure
      if (releases && Array.isArray(releases)) {
        releases = releases.map((release, index) => {
          // Debug: Log the full structure of the first few releases
          if (index < 3) {
            console.log(`DEBUG Release ${index} full structure:`, JSON.stringify(release, null, 2));
          }

          // Ensure each release has a proper ID
          if (!release.id) {
            // Try different possible ID field names from the API
            const possibleIdFields = [
              'id', '_id', 'database_id', 'record_id', 'rowid', 'row_id',
              'cf_id', 'cloudflare_id', 'd1_id', 'uuid', 'key', 'pk'
            ];
            let mappedId = null;

            // Try to find any ID field
            for (const field of possibleIdFields) {
              if (release[field] && release[field] !== '') {
                mappedId = release[field];
                console.log(`Found ID in field '${field}':`, mappedId);
                break;
              }
            }

            // If still no ID found, check if any field looks like an ID (numeric or UUID pattern)
            if (!mappedId) {
              for (const [key, value] of Object.entries(release)) {
                if (typeof value === 'string' || typeof value === 'number') {
                  // Check for common ID patterns
                  if (typeof value === 'number' && value > 0) {
                    mappedId = value;
                    console.log(`Found numeric ID in field '${key}':`, mappedId);
                    break;
                  } else if (typeof value === 'string' &&
                            ((value.length === 36 && value.includes('-')) || // UUID format
                             (value.length === 32 && /^[a-f0-9]{32}$/i.test(value)) || // Hex format
                             (/^\d+$/.test(value)))) { // Pure numeric string
                    mappedId = value;
                    console.log(`Found string ID in field '${key}':`, mappedId);
                    break;
                  }
                }
              }
            }

            // If no ID found, create one based on version and index
            if (!mappedId) {
              mappedId = `api-version-${release.version || `unknown-${index}`}`;
              console.log(`No ID found, generated fallback:`, mappedId);
            }

            return {
              ...release,
              id: mappedId
            };
          }
          return release;
        });

        console.log('Releases after ID mapping:', releases);
      }

      // Sort releases by created_at in descending order (newest first)
      if (releases && releases.length > 0) {
        releases.sort((a, b) => {
          // Handle cases where created_at might be missing or in different formats
          const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
          const dateB = b.created_at ? new Date(b.created_at) : new Date(0);

          // Sort descending (newest first)
          return dateB - dateA;
        });
        console.log('Releases after sorting by created_at:', releases);
      }

      setDatabaseReleases(releases);

      toast({
        title: "Success",
        description: `Loaded ${releases.length} releases from Cloudflare Database`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error loading releases from Cloudflare Database:', error);

      // Reset flags on error to allow retry
      hasLoadedData.current = false;

      toast({
        title: "Error",
        description: `Failed to fetch from Cloudflare Database: ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      isLoadingData.current = false;
      setFetchingFromNotion(false);
    }
  }, [toast]);

  // Manual refresh function that bypasses the one-time protection
  const handleManualRefresh = async () => {
    console.log('🔄 handleManualRefresh: Starting manual refresh');

    // Prevent multiple simultaneous refresh calls
    if (isLoadingData.current) {
      console.log('🔄 handleManualRefresh: Currently loading, skipping');
      return;
    }

    // Prevent rapid successive calls (shorter timeout than auto-load)
    const now = Date.now();
    if (now - lastLoadTime.current < 500) {
      console.log('🔄 handleManualRefresh: Called too quickly, skipping');
      return;
    }

    isLoadingData.current = true;
    lastLoadTime.current = now;
    setFetchingFromNotion(true);

    try {
      const data = await fetchReleases(1, 50, false); // Disable cache
      console.log('Manually fetched data from API:', data);
      let releases = data.releases || data;
      console.log('Releases before sorting:', releases);

      // Map API response to ensure proper ID structure
      if (releases && Array.isArray(releases)) {
        releases = releases.map((release, index) => {
          // Debug: Log the full structure of the first few releases
          if (index < 3) {
            console.log(`DEBUG Release ${index} full structure:`, JSON.stringify(release, null, 2));
          }

          // Ensure each release has a proper ID
          if (!release.id) {
            // Try different possible ID field names from the API
            const possibleIdFields = [
              'id', '_id', 'database_id', 'record_id', 'rowid', 'row_id',
              'cf_id', 'cloudflare_id', 'd1_id', 'uuid', 'key', 'pk'
            ];
            let mappedId = null;

            // Try to find any ID field
            for (const field of possibleIdFields) {
              if (release[field] && release[field] !== '') {
                mappedId = release[field];
                console.log(`Found ID in field '${field}':`, mappedId);
                break;
              }
            }

            // If still no ID found, check if any field looks like an ID (numeric or UUID pattern)
            if (!mappedId) {
              for (const [key, value] of Object.entries(release)) {
                if (typeof value === 'string' || typeof value === 'number') {
                  // Check for common ID patterns
                  if (typeof value === 'number' && value > 0) {
                    mappedId = value;
                    console.log(`Found numeric ID in field '${key}':`, mappedId);
                    break;
                  } else if (typeof value === 'string' &&
                            ((value.length === 36 && value.includes('-')) || // UUID format
                             (value.length === 32 && /^[a-f0-9]{32}$/i.test(value)) || // Hex format
                             (/^\d+$/.test(value)))) { // Pure numeric string
                    mappedId = value;
                    console.log(`Found string ID in field '${key}':`, mappedId);
                    break;
                  }
                }
              }
            }

            // If no ID found, create one based on version and index
            if (!mappedId) {
              mappedId = `api-version-${release.version || `unknown-${index}`}`;
              console.log(`No ID found, generated fallback:`, mappedId);
            }

            return {
              ...release,
              id: mappedId
            };
          }
          return release;
        });

        console.log('Releases after ID mapping:', releases);
      }

      // Sort releases by created_at in descending order (newest first)
      if (releases && releases.length > 0) {
        releases.sort((a, b) => {
          // Handle cases where created_at might be missing or in different formats
          const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
          const dateB = b.created_at ? new Date(b.created_at) : new Date(0);

          // Sort descending (newest first)
          return dateB - dateA;
        });
        console.log('Releases after sorting by created_at:', releases);
      }

      setDatabaseReleases(releases);

      toast({
        title: "Data Refreshed",
        description: `Successfully refreshed ${releases.length} releases from database`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error manually refreshing releases from Cloudflare Database:', error);

      toast({
        title: "Refresh Failed",
        description: `Failed to refresh from database: ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      isLoadingData.current = false;
      setFetchingFromNotion(false);
    }
  };

  useEffect(() => {
    // Set page title
    document.title = "Dashboard - FireworksPlay";

    setReleases(allUpdates);
    setCurrentPage(1); // Reset to first page when data changes
    setLoading(false);

    // Auto-load from database to show release notes on login (only once)
    if (!hasLoadedData.current) {
      fetchFromDatabase();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter releases - use database releases instead of static releases
  const filteredReleases = databaseReleases.slice(indexOfFirstItem, indexOfLastItem);

  // Debug function to check releases structure
  const debugReleases = () => {
    console.log('=== DEBUG: Releases Data Structure ===');
    console.log('Total databaseReleases:', databaseReleases.length);
    console.log('Sample releases with IDs and dates:');
    databaseReleases.slice(0, 3).forEach((release, index) => {
      console.log(`Release ${index}:`, {
        id: release.id,
        version: release.version,
        created_at: release.created_at,
        hasChanges: release.changes && release.changes.length > 0
      });
    });
    console.log('First 10 releases sorted order:');
    databaseReleases.slice(0, 10).forEach((release, index) => {
      console.log(`${index + 1}. ${release.version} (created: ${release.created_at})`);
    });
    console.log('=====================================');
  };

  // Generate unique ID for releases without database ID
  const generateId = (release) => {
    // Use version as ID if database ID is missing
    return release.id || `version-${release.version || 'unknown'}`;
  };

  // Auto-debug when releases change
  React.useEffect(() => {
    if (databaseReleases.length > 0) {
      debugReleases();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [databaseReleases]);

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleEdit = (release) => {
    console.log('handleEdit called with release:', release);
    const releaseId = generateId(release);
    console.log('Generated ID:', releaseId);
    console.log('Release version:', release.version);

    if (!release) {
      console.error('Edit error: Release is missing');
      toast({
        title: "Error",
        description: "Cannot edit: Release data is incomplete",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Ensure the release has an ID (generated if missing)
    const releaseWithId = { ...release, id: releaseId };
    setSelectedRelease(releaseWithId);
    setFormData({
      version: release.version,
      changes: release.changes && release.changes.length > 0 ? release.changes : ['']
    });
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedRelease(null);
    setFormData({ version: '', changes: [''] });
  };

  const handleNew = () => {
    setSelectedRelease(null);
    setFormData({ version: '', changes: [''] });
    setIsNewModalOpen(true);
  };

  const handleSave = async () => {
    try {
      let savedRelease;

      console.log('handleSave - selectedRelease:', selectedRelease);
      console.log('handleSave - formData:', formData);

      // Validate form data
      if (!formData.version || formData.version.trim() === '') {
        throw new Error('Version is required');
      }

      if (selectedRelease && selectedRelease.id) {
        // Update existing release in Cloudflare
        console.log('Updating release with ID:', selectedRelease.id);
        console.log('Form data for update:', JSON.stringify(formData, null, 2));
        savedRelease = await updateRelease(selectedRelease.id, formData);
      } else {
        // Create new release in Cloudflare
        console.log('Creating new release');
        savedRelease = await createRelease(formData);
      }

      // Update local state with proper sorting
      if (selectedRelease && selectedRelease.id) {
        setDatabaseReleases(prev => {
          const updated = prev.map(r => r.id === selectedRelease.id ? savedRelease : r);
          // Re-sort after update
          return updated.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
            const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
            return dateB - dateA;
          });
        });
      } else {
        setDatabaseReleases(prev => {
          const withNew = [savedRelease, ...prev];
          // Re-sort after adding new
          return withNew.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
            const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
            return dateB - dateA;
          });
        });
      }

      setIsEditModalOpen(false);
      setIsNewModalOpen(false);
      setSelectedRelease(null);

      toast({
        title: "Success",
        description: selectedRelease
          ? "Release updated successfully in Cloudflare"
          : "New release created successfully in Cloudflare",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving release:', error);
      toast({
        title: "Error",
        description: `Failed to save release: ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (releaseToDelete) => {
    if (releaseToDelete.id) {
      // Delete from Cloudflare if it has an ID
      try {
        await deleteRelease(releaseToDelete.id);
        setDatabaseReleases(prev => {
          const filtered = prev.filter(r => r.id !== releaseToDelete.id);
          // Maintain sorting order after deletion
          return filtered.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
            const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
            return dateB - dateA;
          });
        });

        toast({
          title: "Success",
          description: "Release deleted successfully from Cloudflare",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error deleting release:', error);
        toast({
          title: "Error",
          description: `Failed to delete release: ${error.message}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      // Local only release
      const updatedReleases = releases.filter(r => r !== releaseToDelete);
      setReleases(updatedReleases);
      // Reset to first page if current page becomes empty after deletion
      const newTotalPages = Math.ceil(updatedReleases.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }

      toast({
        title: "Success",
        description: "Local release deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddChange = () => {
    setFormData(prev => ({
      ...prev,
      changes: [...prev.changes, '']
    }));
  };

  const handleUpdateChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      changes: prev.changes.map((change, i) => i === index ? value : change)
    }));
  };

  const handleRemoveChange = (index) => {
    if (formData.changes.length > 1) {
      setFormData(prev => ({
        ...prev,
        changes: prev.changes.filter((_, i) => i !== index)
      }));
    }
  };

  const handleQuickParse = () => {
    try {
      const parsed = parseQuickRelease(quickInputText);
      if (parsed) {
        setFormData({
          version: parsed.version,
          changes: parsed.changes
        });
        setQuickInputText(''); // Clear the quick input
        toast({
          title: "Success",
          description: "Release note parsed successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Parse Error",
          description: "Unable to parse the release note. Please check the format.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error parsing quick release:', error);
      toast({
        title: "Parse Error",
        description: "An error occurred while parsing the release note.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

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

  // Calculate stats
  const totalReleases = databaseReleases.length;
  const totalChanges = databaseReleases.reduce((sum, release) => sum + release.changes.length, 0);
  const videoCount = databaseReleases.reduce((sum, release) =>
    sum + release.changes.filter(change => isVideoLink(change)).length, 0
  );

  // Simple consistent theme
  // Colors
  const bgPrimary = useColorModeValue("white", "gray.900");
  const bgSecondary = useColorModeValue("gray.50", "gray.800");
  const bgCard = useColorModeValue("white", "gray.800");
  const bgModal = useColorModeValue("white", "gray.800");

  const textPrimary = useColorModeValue("gray.900", "gray.100");
  const textSecondary = useColorModeValue("gray.600", "gray.300");
  const textMuted = useColorModeValue("gray.500", "gray.400");

  const border = useColorModeValue("gray.200", "gray.600");

  // Modern Mobile Release Card Component with Glass Effects
  const MobileReleaseCard = ({ release }) => (
    <ScaleFade initialScale={0.9} in>
      <Card
        bg={bgCard}
        border="1px solid"
        borderColor={border}
        borderRadius="lg"
        mb={4}
        shadow="sm"
        transition="all 0.2s"
        _hover={{
          shadow: "md",
          transform: "none"
        }}
      >
        <CardBody p={4}>
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center" gap={6} flexWrap="wrap">
              <VStack align="start" spacing={1}>
                <Heading
                  size="md"
                  color={textPrimary}
                  fontWeight="bold"
                  noOfLines={1}
                >
                  {release.version}
                </Heading>
                <Text fontSize="xs" color={textSecondary}>
                  ID: {generateId(release) || 'N/A'}
                </Text>
              </VStack>
              <HStack spacing={2}>
                <Circle size="24px" bg="green.500" color="white">
                  <Text fontSize="10px" fontWeight="bold">{release.changes.length}</Text>
                </Circle>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<ChevronDownIcon />}
                    variant="ghost"
                    size="md"
                    borderRadius="none"
                  />
                  <MenuList bg={bgModal} borderColor={border}>
                    <MenuItem
                      icon={<EditIcon />}
                      onClick={() => handleEdit(release)}
                      color={textPrimary}
                    >
                      Edit
                    </MenuItem>
                    <MenuItem
                      icon={<DeleteIcon />}
                      onClick={() => handleDelete(release)}
                      color="red.600"
                    >
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </Flex>

            <HStack spacing={2}>
              {release.changes.filter(change => isVideoLink(change)).map((video, videoIndex) => (
                <Button
                  key={videoIndex}
                  as="a"
                  href={video}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="xs"
                  bg="blue.600"
                  color="white"
                  leftIcon={<ExternalLinkIcon boxSize={3} />}
                  borderRadius="none"
                  fontWeight="medium"
                  _hover={{
                    bg: "blue.700",
                    transform: "none"
                  }}
                  transition="all 0.2s"
                >
                  Video {videoIndex + 1}
                </Button>
              ))}
              <Badge
                bg="blue.600"
                color="white"
                px={3}
                py={1}
                borderRadius="none"
                fontSize="xs"
                fontWeight="medium"
              >
                {release.changes.length} items
              </Badge>
            </HStack>

            <Box>
              <Text fontSize="sm" color={textSecondary} fontWeight="medium" mb={2}>Changes:</Text>
              <List spacing={2}>
                {release.changes.map((change, index) => (
                  <ListItem key={index}>
                    <HStack align="start">
                      <CheckCircleIcon color="green.500" boxSize={4} mt={0.5} />
                      <Text fontSize="sm" noOfLines={3} flex={1}>{change}</Text>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </ScaleFade>
  );

  // Modern Mobile Header Component with Glass Effects
  const MobileHeader = () => (
    <Box
      bg="gray.900"
      color="white"
      py={6}
      px={headerPadding}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(255, 255, 255, 0.1)"
              />
      <Container maxW={containerMaxWidth} position="relative">
        <VStack spacing={4} align="stretch">
          <SlideFade in>
            <Flex justify="space-between" align="center" gap={6} flexWrap="wrap">
              <VStack align="start" spacing={2}>
                <Heading
                  size="lg"
                  fontWeight="semibold"
                  letterSpacing="tight"
                  color="white"
                  position="relative"
                  display="inline-block"
                >
                  Dashboard
                </Heading>
                <Text fontSize="sm" opacity={1} fontWeight="medium" color="white">
                  Manage release notes
                </Text>
              </VStack>

              <HStack spacing={2}>
                <Tooltip label="Refresh data">
                  <IconButton
                    onClick={handleManualRefresh}
                    isLoading={fetchingFromNotion}
                    bg="surface"
                                        border="1px solid rgba(255, 255, 255, 0.3)"
                    icon={<TimeIcon />}
                    size="md"
                    aria-label="Refresh"
                    borderRadius="none"
                    _hover={{
                      bg: "surfaceRaised",
                      transform: "none"
                    }}
                    transition="all 0.2s"
                  />
                </Tooltip>

                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={
                      <Avatar
                        size="sm"
                        name={user?.name || 'User'}
                        bg="surface"
                        color="purple.200"
                        border="2px solid rgba(255, 255, 255, 0.5)"
                      />
                    }
                    bg="surface"
                                        border="1px solid rgba(255, 255, 255, 0.3)"
                    size="md"
                    borderRadius="none"
                    _hover={{
                      bg: "surfaceRaised",
                      transform: "none"
                    }}
                    transition="all 0.2s"
                  />
                  <MenuList
                    bg={bgModal}
                    borderColor={border}
                                        shadow="md"
                  >
                    <MenuItem bg="transparent">
                      <VStack align="start" spacing={2} w="full">
                        <Text fontWeight="bold" fontSize="sm" color={textPrimary}>{user?.name}</Text>
                        <Badge
                          bg="surfaceRaised"
                          color={textPrimary}
                          variant="solid"
                          fontSize="xs"
                          px={3}
                          py={1}
                          borderRadius="none"
                        >
                          {user?.role?.toUpperCase() || 'USER'}
                        </Badge>
                      </VStack>
                    </MenuItem>
                    <MenuItem
                      icon={<ViewIcon />}
                      as={RouterLink}
                      to="/release-note/"
                      fontSize="sm"
                      bg="transparent"
                      color={textPrimary}
                      _hover={{
                        bg: "red.50",
                        color: "red.500"
                      }}
                      borderRadius="md"
                      mx={1}
                      my={1}
                    >
                      View Notes
                    </MenuItem>
                    <MenuItem
                      icon={<DeleteIcon />}
                      onClick={handleLogout}
                      color="red.600"
                      fontSize="sm"
                      bg="transparent"
                      _hover={{ bg: 'rgba(245, 101, 101, 0.1)' }}
                    >
                      Logout
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </Flex>
          </SlideFade>

          {/* Modern Mobile Stats */}
          <SimpleGrid columns={statsColumns} spacing={3}>
            <ScaleFade initialScale={0.8} in>
              <Card
                bg={bgCard}
                                border="1px solid"
                borderColor={border}
                borderRadius="xl"
                overflow="hidden"
                position="relative"
                transition="all 0.3s"
                _hover={{
                  transform: "none",
                  bg: 'rgba(255, 255, 255, 0.25)'
                }}
              >
                <CardBody p={4}>
                  <HStack justify="space-between" align="center">
                    <Stat>
                      <VStack align="start" spacing={1}>
                        <StatLabel fontSize="xs" color={textSecondary} fontWeight="medium">
                          Total Releases
                        </StatLabel>
                        <StatNumber fontSize="xl" color={textPrimary} fontWeight="bold">
                          {totalReleases}
                        </StatNumber>
                      </VStack>
                    </Stat>
                    <Circle size="40px" bg="surface">
                      <Icon as={CheckCircleIcon} boxSize={6} color="green.300" />
                    </Circle>
                  </HStack>
                </CardBody>
              </Card>
            </ScaleFade>

            <ScaleFade initialScale={0.8} in delay={0.1}>
              <Card
                bg={bgCard}
                                border="1px solid"
                borderColor={border}
                borderRadius="xl"
                overflow="hidden"
                position="relative"
                transition="all 0.3s"
                _hover={{
                  transform: "none",
                  bg: 'rgba(255, 255, 255, 0.25)'
                }}
              >
                <CardBody p={4}>
                  <HStack justify="space-between" align="center">
                    <Stat>
                      <VStack align="start" spacing={1}>
                        <StatLabel fontSize="xs" color={textSecondary} fontWeight="medium">
                          Changes Made
                        </StatLabel>
                        <StatNumber fontSize="xl" color={textPrimary} fontWeight="bold">
                          {totalChanges}
                        </StatNumber>
                      </VStack>
                    </Stat>
                    <Circle size="40px" bg="surface">
                      <Icon as={TimeIcon} boxSize={6} color="accent" />
                    </Circle>
                  </HStack>
                </CardBody>
              </Card>
            </ScaleFade>

            <ScaleFade initialScale={0.8} in delay={0.2}>
              <Card
                bg={bgCard}
                                border="1px solid"
                borderColor={border}
                borderRadius="xl"
                overflow="hidden"
                position="relative"
                transition="all 0.3s"
                _hover={{
                  transform: "none",
                  bg: 'rgba(255, 255, 255, 0.25)'
                }}
              >
                <CardBody p={4}>
                  <HStack justify="space-between" align="center">
                    <Stat>
                      <VStack align="start" spacing={1}>
                        <StatLabel fontSize="xs" color={textSecondary} fontWeight="medium">
                          Video Content
                        </StatLabel>
                        <StatNumber fontSize="xl" color={textPrimary} fontWeight="bold">
                          {videoCount}
                        </StatNumber>
                      </VStack>
                    </Stat>
                    <Circle size="40px" bg="surface">
                      <Icon as={ExternalLinkIcon} boxSize={6} color="muted" />
                    </Circle>
                  </HStack>
                </CardBody>
              </Card>
            </ScaleFade>
          </SimpleGrid>

          {/* Modern Mobile Add Button */}
          <ScaleFade initialScale={0.9} in delay={0.3}>
            <Button
              leftIcon={<AddIcon />}
              onClick={handleNew}
              bg="blue.600"
              color="white"
              variant="solid"
              size="lg"
              w="full"
              borderRadius="none"
              fontWeight="semibold"
              letterSpacing="normal"
              textTransform="none"
              fontSize="md"
              py={6}
              boxShadow="none"
              border="2px solid rgba(255, 255, 255, 0.3)"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                bg: "blue.600",
                transition: 'left 0.5s',
              }}
              _hover={{
                bg: "blue.700",
                transform: "none",
                boxShadow: "none",
                border: "2px solid rgba(255, 255, 255, 0.5)",
                _before: {
                  left: '100%'
                }
              }}
              _active={{
                transform: "none",
                boxShadow: "none"
              }}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            >
              <VStack spacing={1}>
                <Text fontSize="lg" fontWeight="semibold">Add release</Text>
                <Text fontSize="xs" opacity={1} fontWeight="medium">Create New Version</Text>
              </VStack>
            </Button>
          </ScaleFade>
        </VStack>
      </Container>
    </Box>
  );

  // Modern Desktop Header Component with Glass Effects
  const DesktopHeader = () => (
    <Box
      bg="gray.900"
      color="white"
      py={10}
      px={headerPadding}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(255, 255, 255, 0.1)"
              />
      <Container maxW={containerMaxWidth} position="relative">
        <VStack spacing={8} align="stretch">
          <SlideFade in>
            <Flex justify="space-between" align="center" gap={6} flexWrap="wrap">
              <VStack align="start" spacing={3}>
                <Heading
                  size="xl"
                  fontWeight="semibold"
                  letterSpacing="tight"
                  color="white"
                  position="relative"
                  display="inline-block"
                >
                  Fireworks Play dashboard
                </Heading>
                </VStack>

              <HStack spacing={4}>
                <Tooltip label="Refresh database" placement="top">
                  <Button
                    onClick={handleManualRefresh}
                    isLoading={fetchingFromNotion}
                    bg="surface"
                                        border="1px solid rgba(255, 255, 255, 0.3)"
                    color={textPrimary}
                    leftIcon={<TimeIcon />}
                    size="md"
                    borderRadius="none"
                    fontWeight="medium"
                    _hover={{
                      bg: "surfaceRaised",
                      transform: "none",
                      boxShadow: "none"
                    }}
                    transition="all 0.3s"
                  >
                    Refresh Data
                  </Button>
                </Tooltip>

                <Button
                  leftIcon={<AddIcon />}
                  onClick={handleNew}
                  bg="blue.600"
                  color="white"
                  variant="solid"
                  size="lg"
                  borderRadius="none"
                  fontWeight="semibold"
                  letterSpacing="normal"
                  textTransform="none"
                  fontSize="md"
                  px={8}
                  py={6}
                  boxShadow="none"
                  border="2px solid rgba(255, 255, 255, 0.3)"
                  position="relative"
                  overflow="hidden"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    bg: "blue.600",
                    transition: 'left 0.5s',
                  }}
                  _hover={{
                    bg: "blue.700",
                    transform: "none",
                    boxShadow: "none",
                    border: "2px solid rgba(255, 255, 255, 0.5)",
                    _before: {
                      left: '100%'
                    }
                  }}
                  _active={{
                    transform: "none",
                    boxShadow: "none"
                  }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  <VStack spacing={1}>
                    <Text fontSize="lg" fontWeight="semibold">Add release</Text>
                    <Text fontSize="xs" opacity={1} fontWeight="medium">Create New Version</Text>
                  </VStack>
                </Button>

                <Menu>
                  <MenuButton
                    as={Button}
                    bg="surface"
                                        border="1px solid rgba(255, 255, 255, 0.3)"
                    color={textPrimary}
                    rightIcon={<ChevronDownIcon />}
                    borderRadius="none"
                    size="md"
                    fontWeight="medium"
                    _hover={{
                      bg: "surfaceRaised",
                      transform: "none",
                      boxShadow: "none"
                    }}
                    transition="all 0.3s"
                  >
                    <HStack spacing={3}>
                      <Avatar
                        size="sm"
                        name={user?.name || 'User'}
                        bg="surface"
                        color="purple.200"
                        border="2px solid rgba(255, 255, 255, 0.8)"
                      />
                      <VStack spacing={0} align="start" display={{ base: 'none', md: 'flex' }}>
                        <Text fontSize="sm" fontWeight="bold">{user?.name || 'User'}</Text>
                        <Text fontSize="xs" opacity={1}>{user?.role || 'user'}</Text>
                      </VStack>
                    </HStack>
                  </MenuButton>
                  <MenuList
                    bg={bgModal}
                    borderColor={border}
                                        shadow="md"
                    borderRadius="xl"
                    py={2}
                  >
                    <MenuItem bg="transparent" _hover={{ bg: 'rgba(102, 126, 234, 0.1)' }}>
                      <VStack align="start" spacing={2} w="full">
                        <HStack w="full" justify="space-between">
                          <Text fontWeight="bold" color={textPrimary}>{user?.name}</Text>
                          <Badge
                            bg="surfaceRaised"
                            color={textPrimary}
                            variant="solid"
                            px={3}
                            py={1}
                            borderRadius="none"
                            fontSize="xs"
                          >
                            {user?.role?.toUpperCase() || 'USER'}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color={textSecondary}>{user?.email}</Text>
                      </VStack>
                    </MenuItem>
                    <MenuItem
                      icon={<ViewIcon />}
                      as={RouterLink}
                      to="/release-note/"
                      bg="transparent"
                      color={textPrimary}
                      _hover={{
                        bg: "red.50",
                        color: "red.500"
                      }}
                      borderRadius="md"
                      mx={1}
                      my={1}
                    >
                      View Release Notes
                    </MenuItem>
                    <MenuItem
                      icon={<DeleteIcon />}
                      onClick={handleLogout}
                      color="red.600"
                      bg="transparent"
                      _hover={{ bg: 'rgba(245, 101, 101, 0.1)' }}
                    >
                      Logout
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </Flex>
          </SlideFade>

          {/* Modern Desktop Stats */}
          <SimpleGrid columns={statsColumns} spacing={6}>
            <ScaleFade initialScale={0.8} in>
              <Card
                bg={bgCard}
                                border="1px solid"
                borderColor={border}
                borderRadius="2xl"
                overflow="hidden"
                position="relative"
                transition="all 0.3s"
                _hover={{
                  transform: "none",
                  bg: 'rgba(255, 255, 255, 0.25)'
                }}
              >
                <CardBody p={6}>
                  <HStack justify="space-between" align="center">
                    <VStack align="start" spacing={2}>
                      <Text fontSize="md" color={textPrimary} fontWeight="semibold">
                        Total Releases
                      </Text>
                      <Heading size="2xl" color={textPrimary} fontWeight="bold">
                        {totalReleases}
                      </Heading>
                      <Text fontSize="xs" color={textSecondary}>
                        Active versions in database
                      </Text>
                    </VStack>
                    <Circle size="60px" bg="surface">
                      <Icon as={CheckCircleIcon} boxSize={8} color="green.300" />
                    </Circle>
                  </HStack>
                </CardBody>
              </Card>
            </ScaleFade>

            <ScaleFade initialScale={0.8} in delay={0.1}>
              <Card
                bg={bgCard}
                                border="1px solid"
                borderColor={border}
                borderRadius="2xl"
                overflow="hidden"
                position="relative"
                transition="all 0.3s"
                _hover={{
                  transform: "none",
                  bg: 'rgba(255, 255, 255, 0.25)'
                }}
              >
                <CardBody p={6}>
                  <HStack justify="space-between" align="center">
                    <VStack align="start" spacing={2}>
                      <Text fontSize="md" color={textPrimary} fontWeight="semibold">
                        Changes Made
                      </Text>
                      <Heading size="2xl" color={textPrimary} fontWeight="bold">
                        {totalChanges}
                      </Heading>
                      <Text fontSize="xs" color={textSecondary}>
                        Total updates across all releases
                      </Text>
                    </VStack>
                    <Circle size="60px" bg="surface">
                      <Icon as={TimeIcon} boxSize={8} color="accent" />
                    </Circle>
                  </HStack>
                </CardBody>
              </Card>
            </ScaleFade>

            <ScaleFade initialScale={0.8} in delay={0.2}>
              <Card
                bg={bgCard}
                                border="1px solid"
                borderColor={border}
                borderRadius="2xl"
                overflow="hidden"
                position="relative"
                transition="all 0.3s"
                _hover={{
                  transform: "none",
                  bg: 'rgba(255, 255, 255, 0.25)'
                }}
              >
                <CardBody p={6}>
                  <HStack justify="space-between" align="center">
                    <VStack align="start" spacing={2}>
                      <Text fontSize="md" color={textPrimary} fontWeight="semibold">
                        Video Content
                      </Text>
                      <Heading size="2xl" color={textPrimary} fontWeight="bold">
                        {videoCount}
                      </Heading>
                      <Text fontSize="xs" color={textSecondary}>
                        Video links and tutorials
                      </Text>
                    </VStack>
                    <Circle size="60px" bg="surface">
                      <Icon as={ExternalLinkIcon} boxSize={8} color="muted" />
                    </Circle>
                  </HStack>
                </CardBody>
              </Card>
            </ScaleFade>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );

  if (loading) {
    return (
      <Box
        minH="100vh"
        bg={bgPrimary}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(255, 255, 255, 0.05)"
                  />
        <Flex
          position="relative"
          justifyContent="center"
          alignItems="center"
          minH="100vh"
        >
          <VStack spacing={6} color={textPrimary} textAlign="center">
            <ScaleFade in>
              <Spinner
                size="xl"
                thickness="4px"
                speed="0.65s"
                emptyColor="rgba(255, 255, 255, 0.3)"
                color={textPrimary}
              />
            </ScaleFade>
            <SlideFade in>
              <VStack spacing={2}>
                <Heading size="lg" fontWeight="bold" letterSpacing="tight">
                  Loading Dashboard
                </Heading>
                <Text fontSize="md" opacity={1} fontWeight="medium">
                  Preparing your modern release management experience
                </Text>
                <Progress
                  size="xs"
                  w="200px"
                  isIndeterminate
                  bg="surface"
                  colorScheme="whiteAlpha"
                />
              </VStack>
            </SlideFade>
          </VStack>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bg={bgPrimary}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(255, 255, 255, 0.03)"
              />
      <Box position="relative">
        {/* Header */}
        <Hide above="md">
          <MobileHeader />
        </Hide>
        <Hide below="md">
          <DesktopHeader />
        </Hide>

        {/* Main Content */}
        <Container maxW={containerMaxWidth} px={contentPadding} py={8}>
          <VStack spacing={8} align="stretch">

            {/* Modern Welcome Message */}
            <ScaleFade in>
              <Alert
                status="success"
                borderRadius="2xl"
                variant="subtle"
                bg="rgba(72, 187, 120, 0.1)"
                                border="1px solid rgba(72, 187, 120, 0.3)"
                shadow="md"
              >
                <AlertIcon boxSize="24px" color="green.500" />
                <Box>
                  <AlertTitle fontSize="lg" fontWeight="bold" color="green.300">
                    Welcome back, {user?.name}.
                  </AlertTitle>
                  <Text fontSize="sm" color="muted" mt={1}>
                    You are logged in as an {user?.role}. Manage your release notes.
                  </Text>
                </Box>
              </Alert>
            </ScaleFade>

            {/* Modern Database Releases Management */}
            <ScaleFade in delay={0.1}>
              <Card
                bg={bgCard}
                                border="1px solid"
                borderColor={border}
                borderRadius="2xl"
                shadow="md"
                overflow="hidden"
                position="relative"
              >
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  h="3px"
                  bg="blue.600"
                />
                <CardHeader
                  bg={bgSecondary}
                                    borderBottom="1px solid"
                  borderBottomColor={border}
                  py={4}
                >
                  <HStack justify="space-between" align="center">
                    <VStack align="start" spacing={2}>
                      <HStack spacing={2}>

                        <Heading
                          size={isMobile ? "lg" : "xl"}
                          fontWeight="bold"
                        >
                          Release Notes ({filteredReleases.length})
                        </Heading>
                      </HStack>
                      </VStack>
                    <HStack spacing={2}>
                      <Circle size="40px" bg="rgba(66, 153, 225, 0.2)">
                        <CheckCircleIcon color="blue.500" boxSize={6} />
                      </Circle>
                      <Tag
                        bg="blue.600"
                        color="white"
                        variant="solid"
                        px={3}
                        py={1}
                        borderRadius="none"
                        fontWeight="medium"
                      >
                        Database
                      </Tag>
                    </HStack>
                  </HStack>
                </CardHeader>
                <CardBody p={0}>
                  {filteredReleases.length > 0 ? (
                    <>
                      {/* Mobile View - Card Layout */}
                      <Hide above="md">
                        <Box p={4}>
                          <VStack spacing={4} align="stretch">
                            {filteredReleases.map((release, _index) => (
                              <MobileReleaseCard key={release.id} release={release} />
                            ))}
                          </VStack>

                          {/* Mobile Pagination Controls */}
                          {totalPages > 1 && (
                            <HStack justify="center" mt={6} spacing={4}>
                              <Button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                isDisabled={currentPage === 1}
                                size="md"
                                variant="outline"
                                colorScheme="blue"
                              >
                                Previous
                              </Button>
                              <Text color="muted" fontSize="sm">
                                Page {currentPage} of {totalPages}
                              </Text>
                              <Button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                isDisabled={currentPage === totalPages}
                                size="md"
                                variant="outline"
                                colorScheme="blue"
                              >
                                Next
                              </Button>
                            </HStack>
                          )}
                        </Box>
                      </Hide>

                      {/* Desktop View - Modern Table Layout */}
                      <Hide below="md">
                        <Box p={6}>
                          <TableContainer
                            bg="rgba(255, 255, 255, 0.1)"
                                                        borderRadius="lg"
                            border="1px solid"
                            borderColor={border}
                          >
                            <Table variant="simple">
                              <Thead>
                                <Tr bg={bgSecondary} borderBottom="2px solid" borderColor={border}>
                                  <Th
                                    fontWeight="bold"
                                    color={textPrimary}
                                    textTransform="none"
                                    fontSize="xs"
                                    letterSpacing="normal"
                                    py={4}
                                    borderRight="1px solid"
                                    borderRightColor={border}
                                  >
                                    Version
                                  </Th>
                                  <Th
                                    fontWeight="bold"
                                    color={textPrimary}
                                    textTransform="none"
                                    fontSize="xs"
                                    letterSpacing="normal"
                                    py={4}
                                    borderRight="1px solid"
                                    borderRightColor={border}
                                  >
                                    Changes
                                  </Th>
                                  <Th
                                    fontWeight="bold"
                                    color={textPrimary}
                                    textTransform="none"
                                    fontSize="xs"
                                    letterSpacing="normal"
                                    py={4}
                                    borderRight="1px solid"
                                    borderRightColor={border}
                                  >
                                    Media Type
                                  </Th>
                                  <Th
                                    fontWeight="bold"
                                    color={textPrimary}
                                    textTransform="none"
                                    fontSize="xs"
                                    letterSpacing="normal"
                                    py={4}
                                    textAlign="center"
                                  >
                                    Actions
                                  </Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {filteredReleases.map((release, _index) => (
                                  <Tr
                                    key={release.id}
                                    _hover={{
                                      bg: bgSecondary,
                                      transform: "none",
                                      boxShadow: "none"
                                    }}
                                    transition="all 0.2s"
                                    borderBottom="1px solid"
                                    borderBottomColor={border}
                                  >
                                    <Td
                                      fontWeight="bold"
                                      borderRight="1px solid"
                                      borderRightColor={border}
                                    >
                                      <VStack align="start" spacing={1}>
                                        <Text fontSize="md" color={textPrimary}>{release.version}</Text>
                                        <Text fontSize="xs" color={textSecondary}>
                                          ID: {generateId(release) || 'N/A'}
                                        </Text>
                                      </VStack>
                                    </Td>
                                    <Td borderRight="1px solid" borderRightColor={border}>
                                      <Badge
                                        bg="blue.600"
                                        color="white"
                                        px={3}
                                        py={1}
                                        borderRadius="none"
                                        fontWeight="medium"
                                        fontSize="xs"
                                      >
                                        {release.changes.length} {release.changes.length === 1 ? 'item' : 'items'}
                                      </Badge>
                                    </Td>
                                    <Td borderRight="1px solid" borderRightColor={border}>
                                      <HStack spacing={2}>
                                        {release.changes.filter(change => isVideoLink(change)).map((video, videoIndex) => (
                                          <Button
                                            key={videoIndex}
                                            as="a"
                                            href={video}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            size="xs"
                                            bg="blue.600"
                                            color="white"
                                            leftIcon={<ExternalLinkIcon boxSize={3} />}
                                            borderRadius="none"
                                            fontWeight="medium"
                                            _hover={{
                                              bg: "blue.700",
                                              transform: "none"
                                            }}
                                            transition="all 0.2s"
                                          >
                                            Video {videoIndex + 1}
                                          </Button>
                                        ))}
                                        <Badge
                                          bg="blue.600"
                                          color="white"
                                          px={2}
                                          py={1}
                                          borderRadius="none"
                                          fontSize="xs"
                                          fontWeight="medium"
                                        >
                                          Content
                                        </Badge>
                                      </HStack>
                                    </Td>
                                    <Td>
                                      <HStack spacing={2} justify="center">
                                        <Tooltip label="Edit Release" placement="top">
                                          <IconButton
                                            icon={<EditIcon />}
                                            size="md"
                                            bg="rgba(66, 153, 225, 0.2)"
                                                                                        border="1px solid rgba(66, 153, 225, 0.3)"
                                            color="accent"
                                            onClick={() => handleEdit(release)}
                                            aria-label="Edit release"
                                            borderRadius="none"
                                            _hover={{
                                              bg: 'rgba(66, 153, 225, 0.3)',
                                              transform: "none"
                                            }}
                                            transition="all 0.2s"
                                          />
                                        </Tooltip>
                                        <Tooltip label="Delete Release" placement="top">
                                          <IconButton
                                            icon={<DeleteIcon />}
                                            size="md"
                                            bg="rgba(245, 101, 101, 0.2)"
                                                                                        border="1px solid rgba(245, 101, 101, 0.3)"
                                            color="red.600"
                                            onClick={() => handleDelete(release)}
                                            aria-label="Delete release"
                                            borderRadius="none"
                                            _hover={{
                                              bg: 'rgba(245, 101, 101, 0.3)',
                                              transform: "none"
                                            }}
                                            transition="all 0.2s"
                                          />
                                        </Tooltip>
                                      </HStack>
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </TableContainer>

                          {/* Desktop Pagination Controls */}
                          {totalPages > 1 && (
                            <HStack justify="center" mt={6} spacing={4}>
                              <Button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                isDisabled={currentPage === 1}
                                size="md"
                                variant="outline"
                                colorScheme="blue"
                              >
                                Previous
                              </Button>
                              <Text color="muted" fontSize="sm">
                                Page {currentPage} of {totalPages}
                              </Text>
                              <Button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                isDisabled={currentPage === totalPages}
                                size="md"
                                variant="outline"
                                colorScheme="blue"
                              >
                                Next
                              </Button>
                            </HStack>
                          )}
                        </Box>
                      </Hide>
                    </>
                  ) : (
                    <Box p={8}>
                      <Alert
                        status="info"
                        borderRadius="2xl"
                        variant="subtle"
                        bg="rgba(66, 153, 225, 0.1)"
                                                border="1px solid rgba(66, 153, 225, 0.3)"
                        shadow="md"
                      >
                        <AlertIcon boxSize="20px" color="blue.500" />
                        <Box>
                          <AlertTitle fontSize={isMobile ? "md" : "lg"} fontWeight="bold" color="accent">
                            No releases found
                          </AlertTitle>
                          <Text fontSize="sm" color="blue.200" mt={1}>
                            Start by creating your first release in the Cloudflare Database using the 'Add Release' button.
                          </Text>
                        </Box>
                      </Alert>
                    </Box>
                  )}
                </CardBody>
              </Card>
            </ScaleFade>

            {/* Modern Database Info */}
            <ScaleFade in delay={0.2}>
              <Alert
                status="info"
                borderRadius="2xl"
                variant="subtle"
                bg="rgba(66, 153, 225, 0.1)"
                                border="1px solid rgba(66, 153, 225, 0.3)"
                shadow="md"
              >
                <AlertIcon boxSize="24px" color="blue.500" />
                <Box>
                  <AlertTitle fontSize="lg" fontWeight="bold" color="accent" mb={2}>
                    💾 Database Information
                  </AlertTitle>
                  <Text fontSize="sm" color="blue.200">
                    All release notes are managed in the Cloudflare Database. View them on the
                    <Button
                      as={RouterLink}
                      to="/release-note/"
                      variant="link"
                      color="red.500"
                      fontWeight="bold"
                      ml={1}
                      fontSize="sm"
                      _hover={{
                        color: "red.500",
                        textDecoration: "underline"
                      }}
                      _active={{
                        color: "red.500",
                        transform: "scale(0.98)"
                      }}
                    >
                      Release Notes View
                    </Button>
                    page.
                  </Text>
                </Box>
              </Alert>
            </ScaleFade>

          </VStack>
        </Container>
      </Box>

      {/* Modern Modals */}
      <>
        {/* Edit Modal */}
        <Modal isOpen={isEditModalOpen} onClose={handleEditModalClose} size={modalSize} isCentered>
          <ModalOverlay />
          <ModalContent
            bg={bgModal}
            borderRadius="lg"
            maxH="90vh"
            overflowY="auto"
          >
            <ModalHeader
              borderBottom="1px solid"
              borderColor={border}
            >
              <Heading size="lg" fontWeight="bold" color={textPrimary}>Edit Release</Heading>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody p={6}>
              <VStack spacing={6}>
                <FormControl>
                  <FormLabel fontWeight="semibold" color={textPrimary}>Version</FormLabel>
                  <Input
                    value={formData.version}
                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="e.g., Version 2025.10.1"
                    bg={bgSecondary}
                    border="1px solid"
                    borderColor={border}
                    borderRadius="lg"
                    color={textPrimary}
                    _placeholder={{ color: textMuted }}
                    _focus={{
                      borderColor: '#667eea',
                      boxShadow: "none"
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="semibold" color={textPrimary}>Changes</FormLabel>
                  <VStack spacing={3} align="stretch">
                    {formData.changes.map((change, index) => (
                      <HStack key={index} spacing={3}>
                        <Textarea
                          value={change}
                          onChange={(e) => handleUpdateChange(index, e.target.value)}
                          placeholder={`Change ${index + 1}`}
                          flex={1}
                          bg={bgSecondary}
                          border="1px solid"
                          borderColor={border}
                          borderRadius="lg"
                          color={textPrimary}
                          _placeholder={{ color: textMuted }}
                          _focus={{
                            borderColor: '#667eea',
                            boxShadow: "none"
                          }}
                        />
                        {formData.changes.length > 1 && (
                          <IconButton
                            icon={<DeleteIcon />}
                            onClick={() => handleRemoveChange(index)}
                            bg="rgba(245, 101, 101, 0.2)"
                            border="1px solid rgba(245, 101, 101, 0.3)"
                            color="red.600"
                            size="md"
                            borderRadius="none"
                            _hover={{
                              bg: 'rgba(245, 101, 101, 0.3)',
                              transform: "none"
                            }}
                            transition="all 0.2s"
                          />
                        )}
                      </HStack>
                    ))}
                    <Button
                      leftIcon={<AddIcon />}
                      onClick={handleAddChange}
                      bg="blue.600"
                      color="white"
                      variant="solid"
                      alignSelf="flex-start"
                      size="sm"
                      borderRadius="none"
                      fontWeight="medium"
                      _hover={{
                        bg: "blue.700",
                        transform: "none"
                      }}
                      transition="all 0.2s"
                    >
                      Add Change
                    </Button>
                  </VStack>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter p={6} borderTop="1px solid" borderColor={border}>
              <Button
                variant="outline"
                mr={3}
                onClick={() => setIsEditModalOpen(false)}
                size="md"
                borderRadius="none"
                fontWeight="medium"
                borderColor={border}
                _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              >
                Cancel
              </Button>
              <Button
                bg="blue.600"
                color="white"
                onClick={handleSave}
                size="md"
                borderRadius="none"
                fontWeight="bold"
                _hover={{
                  bg: "blue.700",
                  transform: "none"
                }}
                transition="all 0.2s"
              >
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* New Modal with Glass Design */}
        <Modal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} size={modalSize} isCentered>
          <ModalOverlay bg="rgba(0, 0, 0, 0.6)" />
          <ModalContent
            bg={bgModal}
                        border="1px solid"
            borderColor="rgba(148, 163, 184, 0.2)"
            borderRadius="2xl"
            boxShadow="none"
            maxH="90vh"
            overflowY="auto"
          >
            <ModalHeader
              bg="blue.600"
              color="white"
              borderTopRadius="2xl"
              py={6}
            >
              <VStack align="start" spacing={1}>
                <Heading size="lg" fontWeight="bold">Add New Release</Heading>
                <Text fontSize="sm" opacity={1}>
                  Create a new release version
                </Text>
              </VStack>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody p={6}>
              <VStack spacing={6}>
                <FormControl>
                  <FormLabel fontWeight="semibold" color={textPrimary}>Version</FormLabel>
                  <Input
                    value={formData.version}
                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="e.g., Version 2025.10.1"
                    bg={bgSecondary}
                    border="1px solid"
                    borderColor={border}
                    borderRadius="lg"
                    color={textPrimary}
                    _placeholder={{ color: textMuted }}
                    _focus={{
                      borderColor: '#48bb78',
                      boxShadow: "none"
                    }}
                  />
                </FormControl>

                <Divider borderColor={border} />

                <FormControl>
                  <FormLabel fontWeight="semibold" color={textPrimary}>Quick Input (Parse Release Note)</FormLabel>
                  <VStack spacing={3} align="stretch">
                    <Textarea
                      value={quickInputText}
                      onChange={(e) => setQuickInputText(e.target.value)}
                      placeholder="Example format:

Version 2025.11.1 | Bundle Version 101 | Version Code 80
Android Target SDK 35 (android 15) | Min 23 (android 5.1)
Custom Map is available now!
- Build your own map.
- Import/Export for sharing.
https://youtu.be/f0wHacQFoZ4"
                      rows={8}
                      bg={bgSecondary}
                      border="1px solid"
                      borderColor={border}
                      borderRadius="lg"
                      _focus={{
                        borderColor: '#9f7aea',
                        boxShadow: "none"
                      }}
                    />
                    <Button
                      onClick={handleQuickParse}
                      bg="blue.600"
                      color="white"
                      variant="solid"
                      alignSelf="flex-start"
                      size="sm"
                      borderRadius="none"
                      fontWeight="medium"
                      _hover={{
                        bg: "blue.700",
                        transform: "none"
                      }}
                      transition="all 0.2s"
                    >
                      Parse Quick Input
                    </Button>
                  </VStack>
                </FormControl>

                <Divider borderColor={border} />

                <FormControl>
                  <FormLabel fontWeight="semibold" color={textPrimary}>Changes</FormLabel>
                  <VStack spacing={3} align="stretch">
                    {formData.changes.map((change, index) => (
                      <HStack key={index} spacing={3}>
                        <Textarea
                          value={change}
                          onChange={(e) => handleUpdateChange(index, e.target.value)}
                          placeholder={`Change ${index + 1}`}
                          flex={1}
                          bg={bgSecondary}
                          border="1px solid"
                          borderColor={border}
                          borderRadius="lg"
                          color={textPrimary}
                          _placeholder={{ color: textMuted }}
                          _focus={{
                            borderColor: '#48bb78',
                            boxShadow: "none"
                          }}
                        />
                        {formData.changes.length > 1 && (
                          <IconButton
                            icon={<DeleteIcon />}
                            onClick={() => handleRemoveChange(index)}
                            bg="rgba(245, 101, 101, 0.2)"
                            border="1px solid rgba(245, 101, 101, 0.3)"
                            color="red.600"
                            size="md"
                            borderRadius="none"
                            _hover={{
                              bg: 'rgba(245, 101, 101, 0.3)',
                              transform: "none"
                            }}
                            transition="all 0.2s"
                          />
                        )}
                      </HStack>
                    ))}
                    <Button
                      leftIcon={<AddIcon />}
                      onClick={handleAddChange}
                      bg="blue.600"
                      color="white"
                      variant="solid"
                      alignSelf="flex-start"
                      size="sm"
                      borderRadius="none"
                      fontWeight="medium"
                      _hover={{
                        bg: "blue.700",
                        transform: "none"
                      }}
                      transition="all 0.2s"
                    >
                      Add Change
                    </Button>
                  </VStack>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter p={6} borderTop="1px solid" borderColor={border}>
              <Button
                variant="outline"
                mr={3}
                onClick={() => setIsNewModalOpen(false)}
                size="md"
                borderRadius="none"
                fontWeight="medium"
                borderColor={border}
                _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              >
                Cancel
              </Button>
              <Button
                bg="blue.600"
                color="white"
                onClick={handleSave}
                size="md"
                borderRadius="none"
                fontWeight="bold"
                _hover={{
                  bg: "blue.700",
                  transform: "none"
                }}
                transition="all 0.2s"
              >
                Add Release
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <IconButton
          aria-label="Scroll to top"
          icon={<ChevronUpIcon />}
          onClick={scrollToTop}
          position="fixed"
          bottom={8}
          right={8}
          size="lg"
          borderRadius="none"
          bg="rgba(239, 68, 68, 0.8)"
          color="white"
          boxShadow="none"
          zIndex={1000}
          _hover={{
            bg: "rgba(220, 38, 38, 0.9)",
            transform: "scale(1.1)",
          }}
          transition="all 0.3s ease"
          opacity={1}
        />
      )}
    </Box>
  );
};

export default ReleaseNoteDashboard;
