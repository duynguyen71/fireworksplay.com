import { useState } from "react";
import { Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton } from "@chakra-ui/react";

export default function ImageSlider({ slides }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const close = () => setSelectedImage(null);
  return (
    <>
      <div className="screenshot-grid">
        {slides.map((slide, index) => (
          <button key={slide.image} className="screenshot-button" onClick={() => setSelectedImage(index)} aria-label={`Open Fireworks Play screenshot ${index + 1}`}>
            <picture>
              <source srcSet={`/images/webp/${index + 1}.webp`} type="image/webp" />
              <img src={slide.image} alt={`Fireworks Play gameplay screenshot ${index + 1}`} loading="lazy" width="2048" height="946" />
            </picture>
          </button>
        ))}
      </div>
      <Modal isOpen={selectedImage !== null} onClose={close} size="6xl" isCentered>
        <ModalOverlay />
        <ModalContent mx={4} bg="surface" aria-label="Fireworks Play screenshot">
          <ModalCloseButton bg="surface" color="foreground" zIndex={1} aria-label="Close screenshot" />
          <ModalBody p={0}>
            {selectedImage !== null && <img src={slides[selectedImage].image} alt={`Fireworks Play gameplay screenshot ${selectedImage + 1}`} style={{ display: "block", width: "100%", height: "auto" }} />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
