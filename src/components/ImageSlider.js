import { Box, Flex, Image, Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, useDisclosure } from "@chakra-ui/react";
import { useState } from "react";

const ImageSlider = ({ slides }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState(null);
  const handleImageClick = (index) => {
    setSelectedImage(index);
    onOpen();
  };

  return (
    <>
      <Box
        className="card-container"
        opacity={1}
      >
        <Flex
          flexWrap="wrap"
          justifyContent="center"
          alignContent="center"
          gap={[2, 2, 3]}
          px={["2vw", "3vw", "4vw"]}
        >
          {slides.map((slide, index) => (
            <Box
              key={slide.image}
              borderRadius="lg"
              overflow="hidden"
              boxShadow="md"
              bg="white"
              transition="transform 0.3s"
              _hover={{ transform: "scale(1.05)" }}
              flex={["1 1 100%", "1 1 calc(50% - 16px)", "1 1 calc(33.333% - 24px)", "1 1 calc(33.333% - 24px)"]}
              maxW={{ base: "400px", md: "450px", lg: "500px" }}
              cursor="pointer"
              onClick={() => handleImageClick(index)}
            >
              <picture>
                <source
                  srcSet={`/images/webp/${index + 1}.webp`}
                  type="image/webp"
                />
                <Image
                  src={`/images/${index + 1}.png`}
                  alt={`Screenshot ${index + 1}`}
                  loading="lazy"
                  w="100%"
                  h="auto"
                  objectFit="cover"
                  position="relative"
                />
              </picture>
            </Box>
          ))}
        </Flex>
      </Box>

      {/* Modal for full-size image view */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="full"
        isCentered
        closeOnOverlayClick={true}
      >
        <ModalOverlay />
        <ModalContent bg="black" border="none">
          <ModalCloseButton color="white" size="lg" />
          <ModalBody
            p={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            h="100vh"
            onClick={onClose}
            cursor="pointer"
          >
            {selectedImage !== null && (
              <Box
                onClick={(e) => e.stopPropagation()}
                cursor="zoom-in"
                maxW="95vw"
                maxH="95vh"
                overflow="hidden"
              >
                <img
                  src={`/images/${selectedImage + 1}.png`}
                  alt={`Screenshot ${selectedImage + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                    KhtmlUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    transformOrigin: 'center center',
                    transition: 'transform 0.3s ease',
                  }}
                  draggable={false}
                  onWheel={(e) => {
                    e.preventDefault();
                    const img = e.target;
                    const scale = e.deltaY < 0 ? 1.2 : 0.8;
                    const currentScale = img.style.transform.replace(/[^\d.]/g, '') || 1;
                    const newScale = Math.min(Math.max(currentScale * scale, 1), 3);
                    img.style.transform = `scale(${newScale})`;
                  }}
                />
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ImageSlider;
