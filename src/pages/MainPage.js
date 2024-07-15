import { Box, Container, Flex, Heading, Text } from "@chakra-ui/react";
import React, { useRef, useState, useEffect } from "react";
import TypeWriter from "../components/TypeWriter";
import { motion, useInView, useScroll, useSpring } from "framer-motion";
import { AppStoreBadge, PlayStoreBadge } from "../components/StoreBadges";
import MainHeading from "../components/MainHeading";
import SecondaryHeading from "../components/SecondaryHeading";
import ParallaxScroll from "../components/ParallaxScroll";

const MainPage = () => {
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const scrollRef = useRef(null);
  const cardVariants = {
    offscreen: {
      y: 300,
    },
    onscreen: {
      y: 50,
      rotate: 0,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 1,
      },
    },
  };
  const cardVariants2 = {
    offscreen: {
      y: 300,
    },
    onscreen: {
      y: 50,
      rotate: 0,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 1.25,
      },
    },
  };
  const cardVariants3 = {
    offscreen: {
      y: 300,
    },
    onscreen: {
      y: 100,
      rotate: -10,
      transition: {
        type: "spring",
        bounce: 0.8,
        duration: 1.5,
      },
    },
  };

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 100) {
        setIsVisible(true);
        window.removeEventListener("scroll", handleScroll);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isVisible, setIsVisible]);

  return (
    <>
      <motion.div className="progress-bar" style={{ scaleX }} />
      <Box textAlign={"center"} margin={"auto"}>
        <Box marginBottom={"10vh"} marginTop={["100px", "150px", "200px"]}>
          <MainHeading text={"Fireworks Play"} />
          <SecondaryHeading
            display="block"
            fontSize={[25, 35, 55, 60]}
            opacity={0.5}
            text={"by"}
            className="newsreader-bold600_fadeEffect"
          />
          <TypeWriter text={"Simplay Studio."} speed={200} />
          {/* SUMMARY */}
          <Box height={"10vh"} />
          <motion.div
            className="card-container"
            initial={"offscreen"}
            whileInView={isVisible && "onscreen"}
            viewport={{ once: true, amount: 0.8 }}
          >
            <motion.div
              className="card"
              style={{ opacity: isVisible ? 1 : 0 }}
              variants={cardVariants}
            >
              <Text
                className="newsreader-bold600"
                display={"block"}
                cursor={"default"}
                fontSize={[25, 35, 55, 60]}
                style={{
                  color: "#2f3542",
                }}
              >
                Fun and Amazing
              </Text>
            </motion.div>
            <motion.div
              style={{ opacity: isVisible ? 1 : 0 }}
              className="card"
              variants={cardVariants2}
            >
              <Text
                cursor={"default"}
                className="newsreader-bold600"
                display={"block"}
                style={{
                  color: "#2f3542",
                }}
                fontSize={[25, 35, 55, 60]}
              >
                simulation fireworks game{" "}
              </Text>{" "}
            </motion.div>
            <motion.div
              style={{ opacity: isVisible ? 1 : 0 }}
              className="card"
              variants={cardVariants3}
            >
              <Text
                className="newsreader-bold600"
                cursor={"default"}
                style={{
                  color: "#2f3542",
                }}
                display={"block"}
                fontSize={[25, 35, 55, 60]}
              >
                that will blow your mind!
              </Text>{" "}
            </motion.div>
          </motion.div>
          {/*  END OF SUMMARY */}

          {/* IMAGE */}
          {/* IMAGE */}

          {/* BADGE STORE */}
          <Box height={"80vh"} />
          <Flex justifyContent={"center"} margin={"auto"} w={"90%"} dir="row">
            <PlayStoreBadge />
            <Box width={"10px"} />
            <AppStoreBadge />
          </Flex>
          {/*END OF BADGE STORE */}
        </Box>
      </Box>
    </>
  );
};

export default MainPage;
