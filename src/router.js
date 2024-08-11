import { createBrowserRouter } from "react-router-dom";
import MainPage from "./pages/MainPage";
import ReleaseNote from "./pages/ReleaseNote";
import NotFoundPage from "./pages/NotFoundPage";
import RootLayout from "./pages/RootLayout";
const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <MainPage />,
      },
      {
        path: "release-note",
        element: <ReleaseNote />,
      },
    ],
  },
  {
    path: "/fireworksplay",
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <MainPage />,
      },
      {
        path: "release-note",
        element: <ReleaseNote />,
      },
    ],
  },
]);

export default router;
