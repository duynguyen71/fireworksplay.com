import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading
        display="inline-block"
        as="h2"
        size="2xl"
      >
        404
      </Heading>
      <Text fontSize="18px" mt={3} mb={2}>
        Page Not Found
      </Text>
      <Text color="muted" mb={6}>
        The page you're looking for does not seem to exist
      </Text>

      <Button
        onClick={() => navigate("/", { replace: true })}
        colorScheme="teal"
        bg="blue.600"
        color="white"
        variant="solid"
      >
        Go to Home
      </Button>
    </Box>
  );
};

export default NotFoundPage;
