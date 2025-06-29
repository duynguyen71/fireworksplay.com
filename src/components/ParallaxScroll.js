import "../parallaxScroll.css";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Text } from "@chakra-ui/react";

function useParallax(value, distance) {
  return useTransform(value, [0, 1], [-distance, distance]);
}

function Image({ id }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useParallax(scrollYProgress, 300);

  return (
    <section>
      <div ref={ref}>
        <Image
          src={`${process.env.PUBLIC_URL}/images/${id}.JPG`}
          alt="A London skyscraper"
        />
      </div>
      <motion.h2 className="motion-h2" style={{ y }}>
        <Text>{`#00${id}`}</Text>
      </motion.h2>
    </section>
  );
}

export default function ParallaxScroll() {
  return (
    <>
      {[1, 2, 3, 4].map((image) => (
        <Image id={image} />
      ))}
      {/* <motion.div className="progress" style={{ scaleX }} /> */}
    </>
  );
}
