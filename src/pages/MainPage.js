import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import TypeWriter from "../components/TypeWriter";
import { motion, useScroll, useSpring } from "framer-motion";
import { AppStoreBadge, PlayStoreBadge } from "../components/StoreBadges";
import MainHeading from "../components/MainHeading";
import SecondaryHeading from "../components/SecondaryHeading";
import ImageSlider from "../components/ImageSlider";
import { SlideData } from "../data/SlideData";
import { useNavigate } from "react-router-dom";
import socialMediaLinks from "../data/SocialMediaLinks";
import SocialButton from "../components/SocialButton";
import { FaDiscord, FaTiktok, FaYoutube } from "react-icons/fa";

const MainPage = () => {
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

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
  const navigate = useNavigate();

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
      {/* SOCIAL BUTTONS */}
      <Box
        zIndex={9000}
        m={2}
        position={"fixed"}
        // top={["none", "6rem"]}
        // bottom={[10, "none"]}
        // right={["none", 0]}
        top={["none", "3rem"]}
        bottom={["3rem", "none"]}
        right={0}
      >
        <VStack spacing={[3, 7]} alignItems={"center"}>
          <SocialButton label={"Discord"} href={socialMediaLinks.discord}>
            <FaDiscord />
          </SocialButton>
          <SocialButton label={"YouTube"} href={socialMediaLinks.youtube}>
            <FaYoutube />
          </SocialButton>
          <SocialButton label={"Tiktok"} href={socialMediaLinks.tiktok}>
            <FaTiktok />
          </SocialButton>
        </VStack>
      </Box>
      {/* END OF SOCIAL BUTTON */}
      <Box textAlign={"center"} margin={"auto"}>
        <Box marginBottom={"5vh"} marginTop={["100px", "150px", "200px"]}>
          <MainHeading text={"Fireworks Play"} />
          <SecondaryHeading
            display="block"
            fontSize={[25, 35, 55, 60]}
            opacity={0.5}
            text={"by"}
            className="newsreader-bold600_fadeEffect"
          />
          <TypeWriter
            color={"#E53E3E"}
            text={"Sim"}
            text2={"play"}
            text3={"Studio"}
            speed={200}
          />
          {/* SUMMARY */}
          <Box height={["10vh", "20vh", "30vh"]} />
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
                Fun & Amazing
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
          <ImageSlider slides={SlideData} isVisible={isVisible} />
          {/* IMAGE */}
          {/* BADGE STORE */}
          <Box height={["15vh", "20vh", "30vh"]} />
          <Flex justifyContent={"center"} margin={"auto"} w={"90%"} dir="row">
            <PlayStoreBadge />
            <Box width={"10px"} />
            <AppStoreBadge />
          </Flex>
          {/*END OF BADGE STORE */}
          {/* COPYRIGHT 2024 */}
          <Box textAlign="center" marginTop="4rem">
            <Text
              display={["inline", "inline", "inline"]}
              cursor={"default"}
              fontSize="sm"
              color="gray.500"
            >
              © 2024 Simplay Studio
            </Text>
            <Text
              cursor={"pointer"}
              onClick={() => {
                window.open("https://simplaystudio.com/privacy");
              }}
              display={["inline", "inline"]}
              fontSize={["sm"]}
              color="gray.500"
            >
              {" | "}
            </Text>
            <Text
              style={{ textDecoration: "none" }}
              display={["inline"]}
              cursor={"pointer"}
              fontSize="sm"
              color="gray.500"
              onClick={() => {
                window.location.href = "mailto:contact@simplaystudio.com";
              }}
            >
              contact@simplaystudio.com{" "}
            </Text>
          </Box>
          {/* COPYRIGHT */}
        </Box>
      </Box>
    </>
  );
};

export default MainPage;
