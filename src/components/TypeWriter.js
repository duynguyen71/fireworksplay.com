import React, { useState, useEffect } from "react";
import MainHeading from "./MainHeading";

const TypingText = ({
  text,
  text2,
  text3,
  color,
  fontSize,
  isFaded,
  typingSpeed = 100,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [displayedText2, setDisplayedText2] = useState("");
  const [index, setIndex] = useState(0);
  const [index2, setIndex2] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isDone2, setIsDone2] = useState(false);
  const space = "\xa0";

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

  useEffect(() => {
    if (text3) {
      text3 = space + text3;
      const interval2 = setInterval(() => {
        if (index2 < text3.length) {
          setDisplayedText2((prev) => prev + text3[index2]);
          setIndex2((prev) => prev + 1);
        } else {
          setIsDone2(true);
          clearInterval(interval2);
        }
      }, typingSpeed);

      return () => {
        return clearInterval(interval2);
      };
    }
  }, [text3, index2, typingSpeed]);

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

      {isDone2 && text3 ? (
        <TypingText
          // color={color}
          text={displayedText2}
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
