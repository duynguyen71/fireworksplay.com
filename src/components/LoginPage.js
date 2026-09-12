import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import authService from "../utils/authService";

const defaultDestination = "/release-note-dashboard";

function getDestination(from) {
  if (!from || typeof from.pathname !== "string" || !from.pathname.startsWith("/")) {
    return defaultDestination;
  }

  return `${from.pathname}${from.search || ""}${from.hash || ""}`;
}

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.email) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: "" }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await authService.login(formData);

      if (!result.success) {
        throw new Error(result.error || "Invalid email or password");
      }

      toast({
        title: "Signed in",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate(getDestination(location.state?.from), { replace: true });
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid email or password",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bg="gray.900"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      py={12}
    >
      <Card maxW="420px" w="full">
        <CardBody p={{ base: 6, md: 8 }}>
          <VStack spacing={8} align="stretch">
            <Box>
              <Text color="blue.300" fontSize="sm" letterSpacing="0.08em" textTransform="uppercase" mb={3}>
                Fireworks Play
              </Text>
              <Heading as="h1" size="lg" mb={2}>
                Admin sign in
              </Heading>
              <Text color="muted">
                Sign in to manage release notes.
              </Text>
            </Box>

            <form onSubmit={handleSubmit}>
              <VStack spacing={5} align="stretch">
                <FormControl isInvalid={Boolean(errors.email)}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="username"
                    placeholder="admin@example.com"
                    size="lg"
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={Boolean(errors.password)}>
                  <FormLabel>Password</FormLabel>
                  <Input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    placeholder="Enter password"
                    size="lg"
                  />
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  isLoading={loading}
                  loadingText="Signing in"
                >
                  Sign in
                </Button>
              </VStack>
            </form>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default LoginPage;
