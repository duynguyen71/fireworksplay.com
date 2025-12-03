import React, { useState, useEffect } from "react";
import MainHeading from "./MainHeading";

// eslint-disable-next-line unused-imports/no-unused-vars
const TypingText = ({
  text,
  text2,
  text3,
  color,
  textColor,
  textColor2,
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
      clearInterval(interval);
    };
  }, [text, index, typingSpeed]);

  useEffect(() => {
    if (text3) {
      const modifiedText3 = space + text3;

      const interval2 = setInterval(() => {
        if (index2 < modifiedText3.length) {
          setDisplayedText2((prev) => prev + modifiedText3[index2]);
          setIndex2((prev) => prev + 1);
        } else {
          setIsDone2(true);
          clearInterval(interval2);
        }
      }, typingSpeed);

      return () => clearInterval(interval2);
    }
  }, [text3, index2, typingSpeed]);


  return (
    <>
      <MainHeading
        color={color}
        opacity={isFaded ? 0.5 : 1}
        text={displayedText}
      />
      {isDone && text2 ? (
        <TypingText
          // eslint-disable-next-line no-undef
          color={textColor || color}
          text={text2}
          fontSize={fontSize}
          isFaded={isFaded}
        />
      ) : (
        <></>
      )}

      {isDone2 && text3 ? (
        <MainHeading
          // eslint-disable-next-line no-undef
          color={textColor2 || color}
          opacity={isFaded ? 0.5 : 1}
          text={displayedText2}
          fontSize={fontSize}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default TypingText;
