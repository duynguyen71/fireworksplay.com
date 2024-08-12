import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box } from "@chakra-ui/react";

const RootLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Box position={"relative"}>
      <Outlet />
    </Box>
  );
};

export default RootLayout;
