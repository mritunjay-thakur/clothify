import { Suspense, lazy, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PageLoader from "./components/PageLoader";
import { useAuth } from "./hooks/useAuth";

const lazyLoad = (importFn) => lazy(importFn);

const WelcomePage = lazyLoad(() => import("./pages/WelcomePage"));
const SignUpPage = lazyLoad(() => import("./pages/SignUpPage"));
const LoginPage = lazyLoad(() => import("./pages/LoginPage"));
const CreatorInfoPage = lazyLoad(() => import("./pages/CreatorInfo"));
const CompleteEditProfile = lazyLoad(() =>
  import("./pages/CompleteEditProfile")
);
const AskClothifyAi = lazyLoad(() => import("./pages/AskClothifyAi"));
const SupportPage = lazyLoad(() => import("./pages/Support"));

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/clothify" replace />;

  return children;
};

const App = () => {
  const { checkAuth } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error("Auth init failed:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [checkAuth]);

  if (!isInitialized) {
    return <PageLoader fullScreen />;
  }

  return (
    <Suspense fallback={<PageLoader fullScreen />}>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route
          path="/login"
          element={
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRoute>
              <SignUpPage />
            </AuthRoute>
          }
        />
        <Route path="/support" element={<SupportPage />} />

        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <CompleteEditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/developer"
          element={
            <ProtectedRoute>
              <CreatorInfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clothify"
          element={
            <ProtectedRoute>
              <AskClothifyAi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conversation/:id"
          element={
            <ProtectedRoute>
              <AskClothifyAi />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
