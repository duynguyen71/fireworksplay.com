import React, { useState, useEffect } from "react";
import { Text } from "@chakra-ui/react";
import { clear } from "@testing-library/user-event/dist/clear";
import MainHeading from "./MainHeading";

const TypingText = ({ text, fontSize, isFaded, typingSpeed = 100 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      } else {
        clearInterval(interval);
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [text, index, typingSpeed]);

  return <MainHeading opacity={isFaded ? 0.5 : 1} text={displayedText} />;
};

export default TypingText;
