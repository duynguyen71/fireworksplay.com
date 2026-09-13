import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainPage from "./pages/MainPage";
import NotFoundPage from "./pages/NotFoundPage";
import RootLayout from "./pages/RootLayout";

const CatalogPage = lazy(() => import("./pages/CatalogPage"));
const ReleaseNote = lazy(() => import("./pages/ReleaseNote"));
const ReleaseNoteDashboard = lazy(() => import("./pages/ReleaseNoteDashboard"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const LoginPage = lazy(() => import("./components/LoginPage"));

const RouteFallback = () => (
  <main className="route-loading" aria-live="polite">
    Loading...
  </main>
);

const suspended = (element) => (
  <Suspense fallback={<RouteFallback />}>
    {element}
  </Suspense>
);

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
      { path: "fireworks", element: suspended(<CatalogPage />) },
      { path: "racks", element: suspended(<CatalogPage racks />) },
      {
        path: "release-note",
        element: suspended(<ReleaseNote />),
      },
      {
        path: "dashboard",
        element: suspended(
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
      { path: "fireworks", element: suspended(<CatalogPage />) },
      { path: "racks", element: suspended(<CatalogPage racks />) },
      {
        path: "release-note",
        element: suspended(<ReleaseNote />),
      },
      {
        path: "dashboard",
        element: suspended(
          <ProtectedRoute requireAdmin>
            <ReleaseNoteDashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: suspended(<LoginPage />),
  },
  {
    path: "/release-note-dashboard",
    element: suspended(
      <ProtectedRoute requireAdmin>
        <ReleaseNoteDashboard />
      </ProtectedRoute>
    ),
  },
]);

export default router;
