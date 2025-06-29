import { Box } from "@chakra-ui/react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { motion } from "framer-motion";
import { cardVariants } from "../data/MotionVariants";

const ImageSlider = ({ slides, isVisible }) => {
  return (
    <>
      <Box height={["25vh", "35vh", "40vh"]} />

      <motion.div
        className="card-container"
        initial={"offscreen"}
        whileInView={isVisible && "onscreen"}
        viewport={{ once: true, amount: 0.8 }}
      >
        <motion.div
          style={{ opacity: isVisible ? 1 : 0 }}
          className="card"
          variants={cardVariants}
        >
          <Box mx={["5vw"]}>
            <Carousel autoPlay infiniteLoop showThumbs={false}>
              {slides.map((slide, index) => (
                <Box key={slide.image} position="relative">
                  <picture>
                    <source
                      srcSet={`/images/webp/${index + 1}.webp`}
                      type="image/webp"
                    />
                    <img
                      src={`/images/${index + 1}.png`}
                      alt={`Slide ${index + 1}`}
                      loading="lazy"
                      style={{ width: "100%", height: "auto" }}
                    />
                  </picture>
                </Box>
              ))}
            </Carousel>
          </Box>
        </motion.div>
      </motion.div>
    </>
  );
};

export default ImageSlider;
