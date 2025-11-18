import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  Box,
  VStack,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  Heading,
  useToast,
} from "@chakra-ui/react";
import authService from "../utils/authService";
import { Link as RouterLink } from "react-router-dom";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Validate token and get fresh user data
        const isValid = await authService.validateToken();

        if (isValid) {
          const currentUser = authService.getUser();

          // Check admin requirements
          if (requireAdmin && currentUser.role !== 'admin') {
            setError("Admin access required for this page");
            setIsAuthenticated(false);
            return;
          }

          setIsAuthenticated(true);
          setUser(currentUser);
        } else {
          setIsAuthenticated(false);
        }

      } catch (error) {
        console.error('Auth check error:', error);
        setError('Authentication check failed');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [requireAdmin, location.pathname]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);

      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.50"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="red.500" thickness="4px" />
          <Text fontSize="lg" color="gray.600">
            Verifying authentication...
          </Text>
        </VStack>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.50"
        px={4}
      >
        <VStack spacing={6} maxW="400px" w="full" textAlign="center">
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <Text>{error}</Text>
          </Alert>

          <Heading size="md" color="red.500">
            Authentication Error
          </Heading>

          <Text color="gray.600">
            {requireAdmin
              ? "This page requires administrator privileges. Please contact an administrator if you believe this is an error."
              : "We couldn't verify your authentication. Please sign in again."
            }
          </Text>

          <VStack spacing={3} w="full">
            <Button
              as={RouterLink}
              to="/login"
              state={{ from: location }}
              colorScheme="red"
              w="full"
            >
              Sign In
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              w="full"
            >
              Try Again
            </Button>
          </VStack>
        </VStack>
      </Box>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message: requireAdmin
            ? "Admin access required for this page"
            : "Please sign in to access this page"
        }}
        replace
      />
    );
  }

  // Authenticated but insufficient permissions
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.50"
        px={4}
      >
        <VStack spacing={6} maxW="400px" w="full" textAlign="center">
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <Text>Access Denied</Text>
          </Alert>

          <Heading size="md" color="orange.500">
            Admin Access Required
          </Heading>

          <Text color="gray.600">
            This page requires administrator privileges. Your current role is: {user?.role || 'user'}
          </Text>

          <VStack spacing={3} w="full">
            <Button
              colorScheme="red"
              onClick={handleLogout}
              w="full"
            >
              Sign Out
            </Button>

            <Button
              as={RouterLink}
              to="/dashboard"
              variant="outline"
              w="full"
            >
              Go to Dashboard
            </Button>
          </VStack>
        </VStack>
      </Box>
    );
  }

  // Authenticated and authorized - render children
  return children;
};

export default ProtectedRoute;