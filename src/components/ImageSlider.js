import { Box, Image } from "@chakra-ui/react";
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
            <Carousel autoPlay infiniteLoop>
              {slides.map((slide, index) => {
                return (
                  <Image
                    key={slide.image}
                    position={"relative"}
                    width={"400px"}
                    height={"auto"}
                    src={`${process.env.PUBLIC_URL}/images/${index + 1}.png`}
                  />
                );
              })}
            </Carousel>
          </Box>
        </motion.div>
      </motion.div>
    </>
  );
};

export default ImageSlider;
