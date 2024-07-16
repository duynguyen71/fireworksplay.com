import React, { useState, useEffect } from "react";
import MainHeading from "./MainHeading";

const TypingText = ({
  text,
  text2,
  color,
  fontSize,
  isFaded,
  typingSpeed = 100,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      } else {
        setIsDone(true);
        clearInterval(interval);
      }
    }, typingSpeed);

    return () => {
      return clearInterval(interval);
    };
  }, [text, index, typingSpeed]);

  return (
    <>
      <MainHeading
        color={text2 ?? color}
        opacity={isFaded ? 0.5 : 1}
        text={displayedText}
      />
      {isDone && text2 ? (
        <TypingText
          color={color}
          text={text2}
          fontSize={fontSize}
          isFaded={isFaded}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default TypingText;
