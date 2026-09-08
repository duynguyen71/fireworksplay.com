import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { RouterProvider } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import router from "./router";
import theme from "./theme";
import "@fontsource/ibm-plex-sans/latin-300.css";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-600.css";

// Keep the requested dark theme even if an older visit saved light mode.
const colorModeManager = { type: "localStorage", get: () => "dark", set: () => {} };

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme} colorModeManager={colorModeManager}>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>
);

reportWebVitals();
