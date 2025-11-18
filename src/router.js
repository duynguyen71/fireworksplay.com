import { createBrowserRouter } from "react-router-dom";
import MainPage from "./pages/MainPage";
import ReleaseNote from "./pages/ReleaseNote";
import ReleaseNoteDashboard from "./pages/ReleaseNoteDashboard";
import NotFoundPage from "./pages/NotFoundPage";
import RootLayout from "./pages/RootLayout";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <NotFoundPage />,
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <MainPage />,
      },
      {
        path: "release-note",
        element: <ReleaseNote />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <ReleaseNoteDashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/fireworksplay",
    errorElement: <NotFoundPage />,
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <MainPage />,
      },
      {
        path: "release-note",
        element: <ReleaseNote />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <ReleaseNoteDashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/release-note-dashboard",
    element: (
      <ProtectedRoute>
        <ReleaseNoteDashboard />
      </ProtectedRoute>
    ),
  },
]);

export default router;
