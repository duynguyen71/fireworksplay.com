
import { Text } from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";

export const useTypewriter = (
  text,
  fontSize,
  isFaded = false,
  speed = 0.000001
) => {
  const [displayText, setDisplayText] = useState("");
  const idx = useRef(0);
  const displayTextRef = useRef("");
  
  useEffect(() => {

    const typingInterval = setInterval(() => {
      if (idx.current < text.length) {
        displayTextRef.current += text.charAt(idx.current);
        setDisplayText(() => displayTextRef.current);
        idx.current += 1;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);

    return () => {
      setDisplayText("");
      clearInterval(typingInterval);
    };
  }, [text, speed]);

  return (
    <Text
      fontSize={fontSize}
      fontFamily={"'Newsreader', sans-serif"}
      fontWeight={600}
      opacity={isFaded ? 0.5 : 1}
    >
      {displayText}
    </Text>
  );
};
