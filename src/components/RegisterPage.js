import React, { useState } from "react";
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
  Alert,
  AlertIcon,
  Card,
  CardBody,
  VStack,
  Link as ChakraLink,
  Divider,
  Progress,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import authService from "../utils/authService";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  // Password strength validator
  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;
    const strength = score <= 2 ? "weak" : score <= 3 ? "medium" : "strong";

    return { requirements, strength, score };
  };

  const passwordValidation = validatePassword(formData.password);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (passwordValidation.score < 3) {
      newErrors.password = "Password does not meet minimum requirements";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      const result = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      toast({
        title: "Registration Successful",
        description: result.message || "Account created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Redirect to dashboard
      navigate("/dashboard");

    } catch (error) {
      console.error("Registration error:", error);

      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordValidation.strength) {
      case "weak": return "red";
      case "medium": return "yellow";
      case "strong": return "green";
      default: return "gray";
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
      py={8}
    >
      <Card maxW="450px" w="full" boxShadow="xl" borderRadius="lg">
        <CardBody p={8}>
          <VStack spacing={6}>
            {/* Header */}
            <Box textAlign="center">
              <Heading size="lg" color="red.500" mb={2}>
                FireworksPlay
              </Heading>
              <Text color="gray.600" fontSize="md">
                Create your account to manage release notes
              </Text>
            </Box>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.name}>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    size="lg"
                    borderRadius="md"
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@fireworksplay.com"
                    size="lg"
                    borderRadius="md"
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>Password</FormLabel>
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    size="lg"
                    borderRadius="md"
                  />

                  {formData.password && (
                    <Box mt={2}>
                      <Progress
                        value={(passwordValidation.score / 5) * 100}
                        size="sm"
                        colorScheme={getPasswordStrengthColor()}
                        borderRadius="md"
                      />
                      <Text fontSize="xs" color="gray.600" mt={1}>
                        Password strength: {passwordValidation.strength}
                      </Text>
                    </Box>
                  )}

                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.confirmPassword}>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    size="lg"
                    borderRadius="md"
                  />
                  <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                </FormControl>

                {/* Password Requirements */}
                {formData.password && (
                  <Box w="full" bg="gray.50" p={3} borderRadius="md">
                    <Text fontSize="sm" fontWeight="bold" mb={2}>
                      Password Requirements:
                    </Text>
                    <List spacing={1} fontSize="xs">
                      <ListItem>
                        <ListIcon
                          as={passwordValidation.requirements.length ? CheckIcon : CloseIcon}
                          color={passwordValidation.requirements.length ? "green.500" : "red.500"}
                        />
                        At least 8 characters
                      </ListItem>
                      <ListItem>
                        <ListIcon
                          as={passwordValidation.requirements.lowercase ? CheckIcon : CloseIcon}
                          color={passwordValidation.requirements.lowercase ? "green.500" : "red.500"}
                        />
                        One lowercase letter
                      </ListItem>
                      <ListItem>
                        <ListIcon
                          as={passwordValidation.requirements.uppercase ? CheckIcon : CloseIcon}
                          color={passwordValidation.requirements.uppercase ? "green.500" : "red.500"}
                        />
                        One uppercase letter
                      </ListItem>
                      <ListItem>
                        <ListIcon
                          as={passwordValidation.requirements.number ? CheckIcon : CloseIcon}
                          color={passwordValidation.requirements.number ? "green.500" : "red.500"}
                        />
                        One number
                      </ListItem>
                    </List>
                  </Box>
                )}

                <Button
                  type="submit"
                  colorScheme="red"
                  size="lg"
                  w="full"
                  isLoading={loading}
                  loadingText="Creating account..."
                  borderRadius="md"
                >
                  Create Account
                </Button>
              </VStack>
            </form>

            <Divider />

            {/* Login Link */}
            <VStack spacing={3}>
              <Text textAlign="center" color="gray.600" fontSize="sm">
                Already have an account?{" "}
                <ChakraLink as={RouterLink} to="/login" color="red.500">
                  Sign in
                </ChakraLink>
              </Text>
            </VStack>

            {/* Terms and Privacy */}
            <Alert status="info" borderRadius="md" fontSize="sm">
              <AlertIcon />
              <Text>
                By creating an account, you agree to our{" "}
                <ChakraLink color="red.500" href="#terms">
                  Terms of Service
                </ChakraLink>{" "}
                and{" "}
                <ChakraLink color="red.500" href="#privacy">
                  Privacy Policy
                </ChakraLink>
              </Text>
            </Alert>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default RegisterPage;