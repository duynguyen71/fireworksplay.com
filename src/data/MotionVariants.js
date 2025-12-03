const cardVariants = {
  offscreen: {
    y: 300,
    opacity: 0,
  },
  onscreen: {
    y: 50,
    rotate: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8,
    },
  },
};
const cardVariants2 = {
  offscreen: {
    y: 300,
    opacity: 0,
  },
  onscreen: {
    y: 50,
    rotate: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.3,
      duration: 0.9,
    },
  },
};
const cardVariants3 = {
  offscreen: {
    y: 300,
    opacity: 0,
  },
  onscreen: {
    y: 100,
    rotate: -10,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.5,
      duration: 1.0,
    },
  },
};

export { cardVariants, cardVariants2, cardVariants3 };
