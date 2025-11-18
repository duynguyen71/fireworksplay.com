import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Heading,
  Text,
  Stack,
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
  Badge,
  Spinner,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from "@chakra-ui/react";
import {
  EditIcon,
  DeleteIcon,
  AddIcon,
  ChevronDownIcon
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

  const totalReleases = releases.length + databaseReleases.length;
  const totalChanges = releases.reduce((sum, release) => sum + release.changes.length, 0) +
    databaseReleases.reduce((sum, release) => sum + release.changes.length, 0);
  const videoCount = releases.reduce((sum, release) =>
    sum + release.changes.filter(change => isVideoLink(change)).length, 0
  ) + databaseReleases.reduce((sum, release) =>
    sum + release.changes.filter(change => isVideoLink(change)).length, 0
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" px={4} py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="2xl" color="red.500">
            FireworksPlay Release Notes Dashboard
          </Heading>
          <HStack spacing={4}>
            <Button
              onClick={fetchFromDatabase}
              isLoading={fetchingFromNotion}
              colorScheme="blue"
              variant="outline"
            >
              Refresh Database
            </Button>
            <Button
              leftIcon={<AddIcon />}
              onClick={handleNew}
              colorScheme="green"
            >
              Add Release
            </Button>

            {/* User Menu */}
            <Menu>
              <MenuButton
                as={Button}
                variant="outline"
                rightIcon={<ChevronDownIcon />}
                leftIcon={
                  <Avatar
                    size="sm"
                    name={user?.name || 'User'}
                    bg="red.500"
                    color="white"
                  />
                }
              >
                <Text fontSize="sm" fontWeight="medium">
                  {user?.name || 'User'}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {user?.role || 'user'}
                </Text>
              </MenuButton>
              <MenuList>
                <MenuItem>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold">{user?.name}</Text>
                    <Text fontSize="sm" color="gray.600">{user?.email}</Text>
                    <Badge colorScheme={user?.role === 'admin' ? 'red' : 'blue'} size="sm">
                      {user?.role?.toUpperCase() || 'USER'}
                    </Badge>
                  </VStack>
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
        </HStack>

        {/* Stats Cards */}
        <Stack direction="row" spacing={4}>
          <Box bg="white" p={4} borderRadius="lg" boxShadow="md" flex={1}>
            <Text fontSize="sm" color="gray.600">Total Releases</Text>
            <Heading size="lg" color="blue.500">{totalReleases}</Heading>
          </Box>
          <Box bg="white" p={4} borderRadius="lg" boxShadow="md" flex={1}>
            <Text fontSize="sm" color="gray.600">Total Changes</Text>
            <Heading size="lg" color="green.500">{totalChanges}</Heading>
          </Box>
          <Box bg="white" p={4} borderRadius="lg" boxShadow="md" flex={1}>
            <Text fontSize="sm" color="gray.600">Videos</Text>
            <Heading size="lg" color="purple.500">{videoCount}</Heading>
          </Box>
        </Stack>

        {/* Welcome Message */}
        <Alert status="success" borderRadius="lg">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Welcome, {user?.name}!</Text>
            <Text fontSize="sm">
              You are logged in as an {user?.role}. You can manage release notes from this dashboard.
            </Text>
          </Box>
        </Alert>

        {/* Database Releases Management */}
        <Box>
          <Heading size="lg" color="red.500" mb={4}>
            Cloudflare Database Releases ({databaseReleases.length})
          </Heading>

          {databaseReleases.length > 0 ? (
            <TableContainer bg="white" borderRadius="lg" boxShadow="md">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Version</Th>
                    <Th>Changes Count</Th>
                    <Th>Has Video</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {databaseReleases.map((release) => (
                    <Tr key={release.id}>
                      <Td fontWeight="bold">{release.version}</Td>
                      <Td>{release.changes.length}</Td>
                      <Td>
                        {release.changes.some(change => isVideoLink(change)) ? (
                          <Badge colorScheme="green">Yes</Badge>
                        ) : (
                          <Badge colorScheme="gray">No</Badge>
                        )}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            onClick={() => handleEdit(release)}
                            aria-label="Edit release"
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            size="sm"
                            onClick={() => handleDelete(release)}
                            colorScheme="red"
                            aria-label="Delete release"
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">No releases in database</Text>
                <Text mt={1}>Click 'Add Release' to create your first release in Cloudflare Storage.</Text>
              </Box>
            </Alert>
          )}
        </Box>

        {/* Local Files Info (Read-only) */}
        <Alert status="info" borderRadius="lg" mt={6}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Local Files Information</Text>
            <Text mt={1}>
              There are {releases.length} local release files that are now integrated into the
              <Button as={RouterLink} to="/release-notes" variant="link" colorScheme="blue" ml={1}>
                Release Notes View
              </Button>
              page. Local files are now read-only and displayed alongside database releases.
            </Text>
          </Box>
        </Alert>

        {/* Edit Modal */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="xl">
          <ModalOverlay />
          <ModalContent>
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
        <Modal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} size="xl">
          <ModalOverlay />
          <ModalContent>
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
                      placeholder="Paste formatted release note here..."
                      rows={6}
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
      </VStack>
    </Box>
  );
};

export default ReleaseNoteDashboard;