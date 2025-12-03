import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  // Alert,
  // AlertIcon,
  Card,
  CardBody,
  VStack,
  Checkbox
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import authService from "../utils/authService";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      toast({
        title: "Success",
        description: result.message || "Login successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Redirect to dashboard
      navigate("/dashboard");

    } catch (error) {
      console.error("Login error:", error);

      toast({
        title: "Login Failed",
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
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <Card maxW="400px" w="full" boxShadow="xl" borderRadius="lg">
        <CardBody p={8}>
          <VStack spacing={6}>
            {/* Header */}
            <Box textAlign="center">
              <Heading size="lg" color="red.500" mb={2}>
                FireworksPlay
              </Heading>
              <Text color="gray.600" fontSize="md">
                Sign in to manage release notes
              </Text>
            </Box>

            {/* Login Form */}
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    size="lg"
                    borderRadius="md"
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>Password</FormLabel>
                  <Input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    size="lg"
                    borderRadius="md"
                  />
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <Checkbox
                    name="rememberMe"
                    isChecked={formData.rememberMe}
                    onChange={handleChange}
                    colorScheme="red"
                  >
                    Remember me
                  </Checkbox>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="red"
                  size="lg"
                  w="full"
                  isLoading={loading}
                  loadingText="Signing in..."
                  borderRadius="md"
                >
                  Sign In
                </Button>
              </VStack>
            </form>

            
            {/* Demo Account Info */}
            {/* <Alert status="info" borderRadius="md" fontSize="sm">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Demo Account:</Text>
                <Text>Email: admin@fireworksplay.com</Text>
                <Text>Password: Demo123!</Text>
              </Box>
            </Alert> */}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default LoginPage;