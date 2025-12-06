import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import TypeWriter from "../components/TypeWriter";
import { motion, useScroll, useSpring } from "framer-motion";
import { AppStoreBadge, PlayStoreBadge } from "../components/StoreBadges";
import MainHeading from "../components/MainHeading";
import SecondaryHeading from "../components/SecondaryHeading";
import ImageSlider from "../components/ImageSlider";
import { SlideData } from "../data/SlideData";
import socialMediaLinks from "../data/SocialMediaLinks";
import SocialButton from "../components/SocialButton";
import { FaDiscord, FaTiktok, FaYoutube } from "react-icons/fa";
import { cardVariants, cardVariants2, cardVariants3 } from "../data/MotionVariants";

const MainPage = () => {
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001,
    mass: 1.2,
  });


  const [showSummary, setShowSummary] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [showStoreBadges, setShowStoreBadges] = useState(false);
  const currentYear = new Date().getFullYear();

  // Show summary after typewriter animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSummary(true);
    }, 2500); // Adjust this delay based on typewriter speed (200ms per character * ~10 characters)
    return () => clearTimeout(timer);
  }, []);

  // Show images after summary animation completes
  useEffect(() => {
    if (showSummary) {
      const timer = setTimeout(() => {
        setShowImages(true);
      }, 1500); // Wait for summary animation to complete
      return () => clearTimeout(timer);
    }
  }, [showSummary]);

  // Show store badges after images load
  useEffect(() => {
    if (showImages) {
      const timer = setTimeout(() => {
        setShowStoreBadges(true);
      }, 1000); // Wait for images to start showing
      return () => clearTimeout(timer);
    }
  }, [showImages]);

  return (
    <>
      <motion.div className="progress-bar" style={{ scaleX }} />
      {/* SOCIAL BUTTONS */}
      <Box
        zIndex={9000}
        m={2}
        position={"fixed"}
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
        <Box marginBottom={"8vh"} marginTop={["100px", "150px", "200px"]}>
          <MainHeading text={"Fireworks Play"} />
          <Box mb={2}>
            <SecondaryHeading
              display="block"
              fontSize={[25, 35, 55, 60]}
              opacity={0.5}
              text={"by"}
              className="newsreader-bold600_fadeEffect"
            />
          </Box>
          <Box>
            <TypeWriter
              color={"#E53E3E"}
              text={"Sim"}
              text2={"play"}
              text3={"Studio"}
              speed={200}
              textColor={"black"}
              textColor2={"black"}
            />
          </Box>
          {/* SUMMARY */}
          <Box minHeight={["40vh", "45vh", "50vh"]} mt={12}>
            {showSummary && (
            <motion.div
              className="card-container"
              initial="offscreen"
              animate="onscreen"
              viewport={{ once: true, amount: 0.8 }}
            >
              <motion.div
                className="card"
                variants={cardVariants}
              >
                <Text
                  className="newsreader-bold600"
                  display={"block"}
                  cursor={"default"}
                  fontSize={[25, 35, 55, 60]}
                  userSelect="none"
                  style={{
                    color: "#2f3542",
                  }}
                >
                  A fun & amazing
                </Text>
              </motion.div>
              <motion.div
                className="card"
                variants={cardVariants2}
              >
                <Text
                  cursor={"default"}
                  className="newsreader-bold600"
                  display={"block"}
                  userSelect="none"
                  style={{
                    color: "#2f3542",
                  }}
                  fontSize={[25, 35, 55, 60]}
                >
                  fireworks simulation game{" "}
                </Text>{" "}
              </motion.div>
              <motion.div
                className="card"
                variants={cardVariants3}
              >
                <Text
                  className="newsreader-bold600"
                  cursor={"default"}
                  userSelect="none"
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
            )}
          </Box>
          {/*  END OF SUMMARY */}
          {/* IMAGE */}
          {showImages && <ImageSlider slides={SlideData} />}
          {/* IMAGE */}
          {/* BADGE STORE */}
          {showStoreBadges && (
            <>
              <Box height={["8vh", "10vh", "12vh"]} />
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
                  cursor="default"
                  fontSize="sm"
                  color="gray.500"
                >
                  © {currentYear} <span style={{ color: "red" }}>Sim</span><span style={{ color: "black" }}>play Studio</span>
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
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default MainPage;
