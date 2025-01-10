import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useChatStore } from "./store/useChatStore";
import CallNotification from "./components/CallNotification";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const { incomingCall, acceptCall, rejectCall } = useChatStore();

  useEffect(() => {
    const root = document.documentElement; // Access the <html> element
    root.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (incomingCall) {
      // Make sure audio can play
      document.addEventListener("click", function initAudio() {
        const audio = new Audio();
        audio.play().catch(() => {});
        document.removeEventListener("click", initAudio);
      });
    }
  }, [incomingCall]);

  useEffect(() => {
    if (incomingCall) {
      // Make sure audio can play
      document.addEventListener("click", function initAudio() {
        const audio = new Audio();
        audio.play().catch(() => {});
        document.removeEventListener("click", initAudio);
      });
    }
  }, [incomingCall]);

  if (isCheckingAuth) {
    return (
      <div data-theme={theme}>
        <div className="min-h-screen grid place-items-center bg-base-200">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/verify-email/:token"
          element={!authUser ? <VerifyEmailPage /> : <Navigate to="/" />}
        />
        <Route
          path="/forgot-password"
          element={!authUser ? <ForgotPasswordPage /> : <Navigate to="/" />}
        />
        <Route
          path="/reset-password/:token"
          element={!authUser ? <ResetPasswordPage /> : <Navigate to="/" />}
        />
      </Routes>
      {incomingCall && (
        <CallNotification
          key={incomingCall.roomId} // Add key to force remount
          callData={incomingCall}
          onAccept={() => acceptCall(incomingCall)}
          onReject={() => rejectCall(incomingCall)}
        />
      )}
      <Toaster />
    </div>
  );
};

export default App;
