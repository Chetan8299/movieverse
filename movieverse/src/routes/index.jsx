import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import AuthInit from "../features/auth/components/AuthInit";
import Header from "../shared/components/Header/Header";
import Loader from "../shared/components/Loader/Loader";
import styles from "./Layout.module.scss";

const HomePage = lazy(() => import("../features/movies/pages/HomePage"));
const MovieDetailPage = lazy(() => import("../features/movies/pages/MovieDetailPage"));
const SearchPage = lazy(() => import("../features/search/pages/SearchPage"));
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("../features/auth/pages/RegisterPage"));
const FavoritesPage = lazy(() => import("../features/favorites/pages/FavoritesPage"));
const WatchHistoryPage = lazy(() => import("../features/watchHistory/pages/WatchHistoryPage"));
const AdminDashboardPage = lazy(() => import("../features/admin/pages/AdminDashboardPage"));
const PersonDetailPage = lazy(() => import("../features/movies/pages/PersonDetailPage"));
const BrowsePage = lazy(() => import("../features/movies/pages/BrowsePage"));

function Layout({ children }) {
  return (
    <div className={styles.layout}>
      <AuthInit />
      <Header />
      <main className={styles.main}>{children}</main>
    </div>
  );
}

function PageLoader() {
  return <Loader />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <HomePage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/person/:id",
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <PersonDetailPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/browse",
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <BrowsePage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/search",
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <SearchPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/movie/:id",
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <MovieDetailPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/tv/:id",
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <MovieDetailPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/login",
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <LoginPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/register",
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <RegisterPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/favorites",
    element: (
      <Layout>
        <ProtectedRoute>
          <Suspense fallback={<PageLoader />}>
            <FavoritesPage />
          </Suspense>
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/watch-history",
    element: (
      <Layout>
        <ProtectedRoute>
          <Suspense fallback={<PageLoader />}>
            <WatchHistoryPage />
          </Suspense>
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/admin",
    element: (
      <Layout>
        <ProtectedRoute requireAdmin>
          <Suspense fallback={<PageLoader />}>
            <AdminDashboardPage />
          </Suspense>
        </ProtectedRoute>
      </Layout>
    ),
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
