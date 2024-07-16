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

export { cardVariants, cardVariants2, cardVariants3 };
