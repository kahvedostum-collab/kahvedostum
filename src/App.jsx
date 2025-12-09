import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";

import Home from "@/pages/Home";
import Login from "@/pages/authentication/Login";
import SignUp from "@/pages/authentication/SignUp";
import ForgotPassword from "@/pages/authentication/ForgotPassword";
import NotFound from "@/pages/errors/NotFound";
import NoAccess from "@/pages/errors/NoAccess";

import ProtectedRoute from "@/components/routing/ProtectedRoute";
import PublicRoute from "@/components/routing/PublicRoute";
import ScrollToTop from "@/components/routing/ScrollToTop";
import EmptyLayout from "@/layout/EmptyLayout";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy loaded pages (protected routes)
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const CoffeeFriends = lazy(() => import("@/pages/friends/CoffeeFriends"));
const Profile = lazy(() => import("@/pages/profile/Profile"));
const About = lazy(() => import("@/pages/others/About"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-linear-to-r from-amber-50 to-orange-50 dark:from-zinc-900 dark:to-zinc-800">
    <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full" />
  </div>
);

const App = () => {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Ana sayfa - auth durumuna göre yönlendirme yapar */}
          <Route path="/" element={<Home />} />

          {/* Public route'lar - EmptyLayout içinde, authenticated kullanıcıyı dashboard'a yönlendirir */}
          <Route
            element={
              <PublicRoute>
                <EmptyLayout />
              </PublicRoute>
            }
          >
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/forgot-password/:token?"
              element={<ForgotPassword />}
            />
          </Route>

          {/* Protected route'lar - auth gerektiren sayfalar (lazy loaded) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <CoffeeFriends />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Genel sayfalar (lazy loaded) */}
          <Route path="/about" element={<About />} />

          {/* Error route'ları */}
          <Route path="/no-access" element={<NoAccess />} />
          <Route path="/not-found" element={<NotFound />} />

          {/* Catch-all - tanımlı olmayan route'lar için */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
