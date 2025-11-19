import React, { useState, useEffect, useCallback } from "react";
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
  TagLabel,
  TagLeftIcon,
  Wrap,
  WrapItem,
  Tooltip,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  Collapse,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Grid,
  GridItem,
  Container,
  useBreakpointValue,
  Hide,
  Show,
  Stack,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  List,
  ListItem,
  ListIcon,
  ButtonGroup,
  Spacer,
} from "@chakra-ui/react";
import {
  EditIcon,
  DeleteIcon,
  AddIcon,
  ChevronDownIcon,
  TimeIcon,
  ViewIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  HamburgerIcon,
  CloseIcon,
  SettingsIcon,
  SearchIcon,
  FilterIcon,
  CopyIcon,
  DownloadIcon,
  BellIcon,
  InfoIcon,
  WarningIcon,
  StarIcon,
  CalendarIcon,
  LinkIcon,
  ChatIcon,
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

const ReleaseNoteDashboard = () => {
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Responsive breakpoints
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });
  const isDesktop = useBreakpointValue({ base: false, lg: true });

  // Responsive sizing
  const containerMaxWidth = useBreakpointValue({ base: "100%", md: "container.md", lg: "container.lg", xl: "container.xl" });
  const statsColumns = useBreakpointValue({ base: 1, sm: 2, lg: 3 });
  const modalSize = useBreakpointValue({ base: "full", md: "xl" });
  const headerPadding = useBreakpointValue({ base: 4, sm: 6, md: 8 });
  const contentPadding = useBreakpointValue({ base: 4, sm: 6, md: 8 });

  const { isOpen: isFilterOpen, onToggle: onFilterToggle } = useDisclosure();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);

      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchFromDatabase = useCallback(async () => {
    setFetchingFromNotion(true);
    try {
      const data = await fetchReleases();
      setDatabaseReleases(data.releases || data);

      toast({
        title: "Success",
        description: `Loaded ${data.releases?.length || data.length} releases from Cloudflare Database`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error loading releases from Cloudflare Database:', error);

      toast({
        title: "Error",
        description: `Failed to fetch from Cloudflare Database: ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setFetchingFromNotion(false);
    }
  }, [toast]);

  useEffect(() => {
    setReleases(allUpdates);
    setLoading(false);

    // Auto-load from database
    fetchFromDatabase();
  }, [fetchFromDatabase]);

  // Filter releases based on search and filter
  const filteredReleases = databaseReleases.filter(release => {
    const matchesSearch = release.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         release.changes.some(change => change.toLowerCase().includes(searchTerm.toLowerCase()));

    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'videos') return matchesSearch && release.changes.some(change => isVideoLink(change));
    if (selectedFilter === 'recent') return matchesSearch; // Add date logic if needed

    return matchesSearch;
  });

  const handleEdit = (release) => {
    setSelectedRelease(release);
    setFormData({
      version: release.version,
      changes: release.changes.length > 0 ? release.changes : ['']
    });
    setIsEditModalOpen(true);
  };

  const handleNew = () => {
    setSelectedRelease(null);
    setFormData({ version: '', changes: [''] });
    setIsNewModalOpen(true);
  };

  const handleSave = async () => {
    try {
      let savedRelease;

      if (selectedRelease && selectedRelease.id) {
        // Update existing release in Cloudflare
        savedRelease = await updateRelease(selectedRelease.id, formData);
      } else {
        // Create new release in Cloudflare
        savedRelease = await createRelease(formData);
      }

      // Update local state
      if (selectedRelease && selectedRelease.id) {
        setDatabaseReleases(prev =>
          prev.map(r => r.id === selectedRelease.id ? savedRelease : r)
        );
      } else {
        setDatabaseReleases(prev => [savedRelease, ...prev]);
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
        setDatabaseReleases(prev => prev.filter(r => r.id !== releaseToDelete.id));

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

  // Color mode values for dynamic theming
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBg = useColorModeValue("linear-gradient(135deg, #667eea 0%, #764ba2 100%)", "linear-gradient(135deg, #553c9a 0%, #44337a 100%)");
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
  const tableRowHoverBg = useColorModeValue("gray.50", "gray.700");

  // Mobile Release Card Component
  const MobileReleaseCard = ({ release }) => (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor} shadow="md" mb={4}>
      <CardBody>
        <VStack spacing={3} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading size="sm" color="blue.600" noOfLines={1}>
              {release.version}
            </Heading>
            <HStack spacing={2}>
              <Badge colorScheme="green" variant="subtle" fontSize="xs">
                {release.changes.length} changes
              </Badge>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<ChevronDownIcon />}
                  variant="ghost"
                  size="sm"
                />
                <MenuList>
                  <MenuItem icon={<EditIcon />} onClick={() => handleEdit(release)}>
                    Edit
                  </MenuItem>
                  <MenuItem icon={<DeleteIcon />} onClick={() => handleDelete(release)} color="red.600">
                    Delete
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>

          <VStack align="start" spacing={2}>
            <Wrap>
              {release.changes.some(change => isVideoLink(change)) && (
                <WrapItem>
                  <Tag colorScheme="purple" variant="solid" size="sm">
                    <TagLeftIcon as={ExternalLinkIcon} />
                    <TagLabel>Video</TagLabel>
                  </Tag>
                </WrapItem>
              )}
              <WrapItem>
                <Tag colorScheme="blue" variant="outline" size="sm">
                  {release.changes.length} items
                </Tag>
              </WrapItem>
            </Wrap>

            <Box>
              <Text fontSize="xs" color="gray.600" mb={1}>Recent changes:</Text>
              <List spacing={1} fontSize="xs">
                {release.changes.slice(0, 2).map((change, index) => (
                  <ListItem key={index} noOfLines={2}>
                    <ListIcon as={CheckCircleIcon} color="green.500" boxSize={3} />
                    {change}
                  </ListItem>
                ))}
                {release.changes.length > 2 && (
                  <Text fontSize="xs" color="gray.500">
                    +{release.changes.length - 2} more...
                  </Text>
                )}
              </List>
            </Box>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );

  // Mobile Header Component
  const MobileHeader = () => (
    <Box bgGradient={headerBg} color="white" py={6} px={headerPadding}>
      <Container maxW={containerMaxWidth}>
        <VStack spacing={4} align="stretch">
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading size="lg" fontWeight="bold">
                🎆 Dashboard
              </Heading>
              <Text fontSize="sm" opacity={0.9}>
                Manage releases
              </Text>
            </VStack>

            <HStack spacing={2}>
              <Tooltip label="Refresh">
                <IconButton
                  onClick={fetchFromDatabase}
                  isLoading={fetchingFromNotion}
                  colorScheme="whiteAlpha"
                  variant="solid"
                  icon={<TimeIcon />}
                  size="sm"
                  aria-label="Refresh"
                />
              </Tooltip>

              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<Avatar size="sm" name={user?.name || 'User'} bg="white" color="purple.600" />}
                  colorScheme="whiteAlpha"
                  variant="solid"
                  size="sm"
                />
                <MenuList bg={cardBg} borderColor={borderColor}>
                  <MenuItem bg="transparent">
                    <VStack align="start" spacing={1} w="full">
                      <Text fontWeight="bold" fontSize="sm">{user?.name}</Text>
                      <Badge colorScheme={user?.role === 'admin' ? 'red' : 'blue'} variant="solid" fontSize="xs">
                        {user?.role?.toUpperCase() || 'USER'}
                      </Badge>
                    </VStack>
                  </MenuItem>
                  <MenuItem icon={<ViewIcon />} as={RouterLink} to="/release-notes" fontSize="sm">
                    View Notes
                  </MenuItem>
                  <MenuItem icon={<DeleteIcon />} onClick={handleLogout} color="red.600" fontSize="sm">
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>

          {/* Mobile Stats */}
          <SimpleGrid columns={statsColumns} spacing={3}>
            <Card bg="whiteAlpha.100" backdropFilter="blur(10px)" border="1px solid" borderColor="whiteAlpha.200">
              <CardBody p={3}>
                <Stat>
                  <StatLabel fontSize="xs" color="whiteAlpha.800">Releases</StatLabel>
                  <StatNumber fontSize="lg" color="white">{totalReleases}</StatNumber>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="whiteAlpha.100" backdropFilter="blur(10px)" border="1px solid" borderColor="whiteAlpha.200">
              <CardBody p={3}>
                <Stat>
                  <StatLabel fontSize="xs" color="whiteAlpha.800">Changes</StatLabel>
                  <StatNumber fontSize="lg" color="white">{totalChanges}</StatNumber>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="whiteAlpha.100" backdropFilter="blur(10px)" border="1px solid" borderColor="whiteAlpha.200">
              <CardBody p={3}>
                <Stat>
                  <StatLabel fontSize="xs" color="whiteAlpha.800">Videos</StatLabel>
                  <StatNumber fontSize="lg" color="white">{videoCount}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Mobile Add Button */}
          <Button
            leftIcon={<AddIcon />}
            onClick={handleNew}
            colorScheme="green"
            variant="solid"
            size="md"
            w="full"
          >
            Add New Release
          </Button>
        </VStack>
      </Container>
    </Box>
  );

  // Desktop Header Component
  const DesktopHeader = () => (
    <Box bgGradient={headerBg} color="white" py={8} px={headerPadding}>
      <Container maxW={containerMaxWidth}>
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={2}>
              <Heading size="2xl" fontWeight="bold">
                🎆 FireworksPlay Dashboard
              </Heading>
              <Text fontSize="lg" opacity={0.9}>
                Manage your release notes with ease
              </Text>
            </VStack>

            <HStack spacing={4}>
              <Tooltip label="Refresh database" placement="top">
                <Button
                  onClick={fetchFromDatabase}
                  isLoading={fetchingFromNotion}
                  colorScheme="whiteAlpha"
                  variant="solid"
                  leftIcon={<TimeIcon />}
                >
                  Refresh
                </Button>
              </Tooltip>

              <Button
                leftIcon={<AddIcon />}
                onClick={handleNew}
                colorScheme="green"
                variant="solid"
                size="lg"
              >
                Add Release
              </Button>

              <Menu>
                <MenuButton
                  as={Button}
                  colorScheme="whiteAlpha"
                  variant="solid"
                  rightIcon={<ChevronDownIcon />}
                >
                  <HStack spacing={2}>
                    <Avatar
                      size="sm"
                      name={user?.name || 'User'}
                      bg="white"
                      color="purple.600"
                      border="2px solid white"
                    />
                    <VStack spacing={0} align="start" display={{ base: 'none', md: 'flex' }}>
                      <Text fontSize="sm" fontWeight="bold">{user?.name || 'User'}</Text>
                      <Text fontSize="xs" opacity={0.8}>{user?.role || 'user'}</Text>
                    </VStack>
                  </HStack>
                </MenuButton>
                <MenuList bg={cardBg} borderColor={borderColor}>
                  <MenuItem bg="transparent">
                    <VStack align="start" spacing={2} w="full">
                      <HStack w="full" justify="space-between">
                        <Text fontWeight="bold">{user?.name}</Text>
                        <Badge colorScheme={user?.role === 'admin' ? 'red' : 'blue'} variant="solid">
                          {user?.role?.toUpperCase() || 'USER'}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">{user?.email}</Text>
                    </VStack>
                  </MenuItem>
                  <MenuItem
                    icon={<ViewIcon />}
                    as={RouterLink}
                    to="/release-notes"
                  >
                    View Release Notes
                  </MenuItem>
                  <MenuItem
                    icon={<DeleteIcon />}
                    onClick={handleLogout}
                    color="red.600"
                  >
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>

          {/* Desktop Stats */}
          <SimpleGrid columns={statsColumns} spacing={6}>
            <Card bg="whiteAlpha.100" backdropFilter="blur(10px)" border="1px solid" borderColor="whiteAlpha.200">
              <CardBody>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="whiteAlpha.800" fontWeight="medium">Total Releases</Text>
                    <Heading size="lg" color="white">{totalReleases}</Heading>
                  </VStack>
                  <Icon as={CheckCircleIcon} boxSize={10} color="green.300" />
                </HStack>
              </CardBody>
            </Card>

            <Card bg="whiteAlpha.100" backdropFilter="blur(10px)" border="1px solid" borderColor="whiteAlpha.200">
              <CardBody>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="whiteAlpha.800" fontWeight="medium">Total Changes</Text>
                    <Heading size="lg" color="white">{totalChanges}</Heading>
                  </VStack>
                  <Icon as={TimeIcon} boxSize={10} color="blue.300" />
                </HStack>
              </CardBody>
            </Card>

            <Card bg="whiteAlpha.100" backdropFilter="blur(10px)" border="1px solid" borderColor="whiteAlpha.200">
              <CardBody>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="whiteAlpha.800" fontWeight="medium">Video Content</Text>
                    <Heading size="lg" color="white">{videoCount}</Heading>
                  </VStack>
                  <Icon as={ExternalLinkIcon} boxSize={10} color="purple.300" />
                </HStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="60vh" bgGradient={headerBg}>
        <VStack spacing={4} color="white">
          <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="white" />
          <Text fontSize="lg" fontWeight="medium">Loading Dashboard...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={pageBg}>
      {/* Header */}
      <Hide above="md">
        <MobileHeader />
      </Hide>
      <Hide below="md">
        <DesktopHeader />
      </Hide>

      {/* Main Content */}
      <Container maxW={containerMaxWidth} px={contentPadding} py={6}>
        <VStack spacing={6} align="stretch">

          {/* Welcome Message */}
          <Alert status="success" borderRadius="lg" variant="solid">
            <AlertIcon boxSize="20px" />
            <Box>
              <AlertTitle>Welcome back, {user?.name}! 👋</AlertTitle>
              <Text fontSize="sm">
                You are logged in as an {user?.role}. You can manage release notes from this dashboard.
              </Text>
            </Box>
          </Alert>

          {/* Search and Filter Bar */}
          <Card bg={cardBg} border="1px solid" borderColor={borderColor} shadow="md">
            <CardBody p={isMobile ? 3 : 4}>
              <VStack spacing={3}>
                <FormControl>
                  <Input
                    placeholder="Search releases or changes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftElement={<SearchIcon />}
                    size={isMobile ? "sm" : "md"}
                  />
                </FormControl>

                <HStack spacing={2} w="full" justify="stretch">
                  <ButtonGroup size={isMobile ? "sm" : "md"} w="full">
                    <Button
                      variant={selectedFilter === 'all' ? 'solid' : 'outline'}
                      onClick={() => setSelectedFilter('all')}
                      flex={1}
                      colorScheme={selectedFilter === 'all' ? 'blue' : 'gray'}
                    >
                      All
                    </Button>
                    <Button
                      variant={selectedFilter === 'videos' ? 'solid' : 'outline'}
                      onClick={() => setSelectedFilter('videos')}
                      flex={1}
                      colorScheme={selectedFilter === 'videos' ? 'purple' : 'gray'}
                    >
                      Videos
                    </Button>
                    <Button
                      variant={selectedFilter === 'recent' ? 'solid' : 'outline'}
                      onClick={() => setSelectedFilter('recent')}
                      flex={1}
                      colorScheme={selectedFilter === 'recent' ? 'green' : 'gray'}
                    >
                      Recent
                    </Button>
                  </ButtonGroup>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Database Releases Management */}
          <Card bg={cardBg} border="1px solid" borderColor={borderColor} shadow="lg">
            <CardHeader bg={tableHeaderBg} borderTopRadius="lg">
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={0}>
                  <Heading size={isMobile ? "md" : "lg"} color="red.500">
                    🗄️ Database Releases ({filteredReleases.length})
                  </Heading>
                  {searchTerm && (
                    <Text fontSize="xs" color="gray.600">
                      Showing results for "{searchTerm}"
                    </Text>
                  )}
                </VStack>
                <Tag colorScheme="blue" variant="solid">
                  <TagLeftIcon as={CheckCircleIcon} />
                  <TagLabel>Database</TagLabel>
                </Tag>
              </HStack>
            </CardHeader>
            <CardBody>
              {filteredReleases.length > 0 ? (
                <>
                  {/* Mobile View - Card Layout */}
                  <Hide above="md">
                    <VStack spacing={0} align="stretch">
                      {filteredReleases.map((release) => (
                        <MobileReleaseCard key={release.id} release={release} />
                      ))}
                    </VStack>
                  </Hide>

                  {/* Desktop View - Table Layout */}
                  <Hide below="md">
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr bg={tableHeaderBg}>
                            <Th fontWeight="bold">Version</Th>
                            <Th fontWeight="bold">Changes</Th>
                            <Th fontWeight="bold">Media</Th>
                            <Th fontWeight="bold" textAlign="center">Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredReleases.map((release) => (
                            <Tr key={release.id} _hover={{ bg: tableRowHoverBg }}>
                              <Td fontWeight="bold" color="blue.600">
                                {release.version}
                              </Td>
                              <Td>
                                <Badge colorScheme="green" variant="subtle">
                                  {release.changes.length} {release.changes.length === 1 ? 'change' : 'changes'}
                                </Badge>
                              </Td>
                              <Td>
                                <Wrap>
                                  {release.changes.some(change => isVideoLink(change)) && (
                                    <WrapItem>
                                      <Tag colorScheme="purple" variant="solid" size="sm">
                                        <TagLeftIcon as={ExternalLinkIcon} />
                                        <TagLabel>Video</TagLabel>
                                      </Tag>
                                    </WrapItem>
                                  )}
                                  <WrapItem>
                                    <Tag colorScheme="blue" variant="outline" size="sm">
                                      <TagLabel>{release.changes.length} items</TagLabel>
                                    </Tag>
                                  </WrapItem>
                                </Wrap>
                              </Td>
                              <Td>
                                <HStack spacing={2} justify="center">
                                  <Tooltip label="Edit Release">
                                    <IconButton
                                      icon={<EditIcon />}
                                      size="sm"
                                      colorScheme="blue"
                                      variant="ghost"
                                      onClick={() => handleEdit(release)}
                                      aria-label="Edit release"
                                    />
                                  </Tooltip>
                                  <Tooltip label="Delete Release">
                                    <IconButton
                                      icon={<DeleteIcon />}
                                      size="sm"
                                      colorScheme="red"
                                      variant="ghost"
                                      onClick={() => handleDelete(release)}
                                      aria-label="Delete release"
                                    />
                                  </Tooltip>
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Hide>
                </>
              ) : (
                <Alert status="info" borderRadius="lg" variant="subtle">
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize={isMobile ? "sm" : "md"}>
                      No releases found
                    </AlertTitle>
                    <Text fontSize="sm">
                      {searchTerm
                        ? `No releases match your search for "${searchTerm}"`
                        : "Click 'Add Release' to create your first release in Cloudflare Database."
                      }
                    </Text>
                  </Box>
                </Alert>
              )}
            </CardBody>
          </Card>

          {/* Database Info */}
          <Alert status="info" borderRadius="lg" variant="subtle">
            <AlertIcon />
            <Box>
              <AlertTitle fontSize="md">💾 Database Information</AlertTitle>
              <Text fontSize="sm">
                All release notes are managed in the Cloudflare Database. View them on the
                <Button as={RouterLink} to="/release-notes" variant="link" colorScheme="blue" ml={1} fontSize="sm">
                  Release Notes View
                </Button>
                page.
              </Text>
            </Box>
          </Alert>

        </VStack>
      </Container>

      {/* Modals */}
      <>
        {/* Edit Modal */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size={modalSize}>
          <ModalOverlay />
          <ModalContent maxH="90vh" overflowY="auto">
            <ModalHeader>Edit Release</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Version</FormLabel>
                  <Input
                    value={formData.version}
                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="e.g., Version 2025.10.1"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Changes</FormLabel>
                  <VStack spacing={2} align="stretch">
                    {formData.changes.map((change, index) => (
                      <HStack key={index}>
                        <Textarea
                          value={change}
                          onChange={(e) => handleUpdateChange(index, e.target.value)}
                          placeholder={`Change ${index + 1}`}
                          flex={1}
                        />
                        {formData.changes.length > 1 && (
                          <IconButton
                            icon={<DeleteIcon />}
                            onClick={() => handleRemoveChange(index)}
                            colorScheme="red"
                            size="sm"
                          />
                        )}
                      </HStack>
                    ))}
                    <Button
                      leftIcon={<AddIcon />}
                      onClick={handleAddChange}
                      variant="outline"
                      alignSelf="flex-start"
                    >
                      Add Change
                    </Button>
                  </VStack>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={3} onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleSave}>
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* New Modal */}
        <Modal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} size={modalSize}>
          <ModalOverlay />
          <ModalContent maxH="90vh" overflowY="auto">
            <ModalHeader>Add New Release</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Version</FormLabel>
                  <Input
                    value={formData.version}
                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="e.g., Version 2025.10.1"
                  />
                </FormControl>

                <Divider />

                <FormControl>
                  <FormLabel>Quick Input (Parse Release Note)</FormLabel>
                  <VStack spacing={2} align="stretch">
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
                    />
                    <Button
                      onClick={handleQuickParse}
                      colorScheme="purple"
                      variant="outline"
                      alignSelf="flex-start"
                    >
                      Parse Quick Input
                    </Button>
                  </VStack>
                </FormControl>

                <Divider />

                <FormControl>
                  <FormLabel>Changes</FormLabel>
                  <VStack spacing={2} align="stretch">
                    {formData.changes.map((change, index) => (
                      <HStack key={index}>
                        <Textarea
                          value={change}
                          onChange={(e) => handleUpdateChange(index, e.target.value)}
                          placeholder={`Change ${index + 1}`}
                          flex={1}
                        />
                        {formData.changes.length > 1 && (
                          <IconButton
                            icon={<DeleteIcon />}
                            onClick={() => handleRemoveChange(index)}
                            colorScheme="red"
                            size="sm"
                          />
                        )}
                      </HStack>
                    ))}
                    <Button
                      leftIcon={<AddIcon />}
                      onClick={handleAddChange}
                      variant="outline"
                      alignSelf="flex-start"
                    >
                      Add Change
                    </Button>
                  </VStack>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={3} onClick={() => setIsNewModalOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="green" onClick={handleSave}>
                Add Release
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    </Box>
  );
};

export default ReleaseNoteDashboard;