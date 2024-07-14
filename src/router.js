import { createBrowserRouter } from "react-router-dom";
import MainPage from "./pages/MainPage";
const router = createBrowserRouter([
  {
    path: "/",
    // element: <Main />,
    // errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <MainPage></MainPage>,
      },
    ],
  },
]);

export default router;
