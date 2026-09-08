import { createBrowserRouter } from "react-router-dom";
import MainPage from "./pages/MainPage";
import CatalogPage from "./pages/CatalogPage";
import ReleaseNote from "./pages/ReleaseNote";
import ReleaseNoteDashboard from "./pages/ReleaseNoteDashboard";
import NotFoundPage from "./pages/NotFoundPage";
import RootLayout from "./pages/RootLayout";
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
      { path: "fireworks", element: <CatalogPage /> },
      { path: "racks", element: <CatalogPage racks /> },
      {
        path: "release-note",
        element: <ReleaseNote />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute requireAdmin>
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
      { path: "fireworks", element: <CatalogPage /> },
      { path: "racks", element: <CatalogPage racks /> },
      {
        path: "release-note",
        element: <ReleaseNote />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute requireAdmin>
            <ReleaseNoteDashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/release-note-dashboard",
    element: (
      <ProtectedRoute requireAdmin>
        <ReleaseNoteDashboard />
      </ProtectedRoute>
    ),
  },
]);

export default router;
