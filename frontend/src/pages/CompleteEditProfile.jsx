import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Silk from "../../jsrepo/Silk/Silk";
import HeaderNonAuthUser from "../components/HeaderNonAuthUser";

const EditProfile = () => {
  const navigate = useNavigate();
  const {
    authUser,
    editProfile,
    loading: authLoading,
    error: authError,
    logout,
  } = useAuth();

  const [activeSection, setActiveSection] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
    deleteConfirm: false,
  });
  const [currentEmail, setCurrentEmail] = useState("");
  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const error = authError || localError;

  useEffect(() => {
    if (authUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: authUser.name || authUser.fullName || "",
        email: authUser.email || "",
      }));
      setCurrentEmail(authUser.email || "");
    }
  }, [authUser]);

  useEffect(() => {
    setLocalError(null);
    setSuccessMessage(null);
  }, [formData]);

  const handleBackToProfile = () => {
    setActiveSection(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateName = () => {
    if (!formData.fullName.trim()) {
      setLocalError("Name is required");
      return false;
    }
    if (formData.fullName.trim().length < 2) {
      setLocalError("Name must be at least 2 characters");
      return false;
    }
    return true;
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      setLocalError("Email is required");
      return false;
    }
    if (!emailRegex.test(formData.email.trim())) {
      setLocalError("Invalid email format");
      return false;
    }
    if (formData.email.trim().toLowerCase() === currentEmail.toLowerCase()) {
      setLocalError("New email must be different from current email");
      return false;
    }
    return true;
  };

  const validatePasswordChange = () => {
    if (!formData.newPassword) {
      setLocalError("New password is required");
      return false;
    }
    if (formData.newPassword.length < 6) {
      setLocalError("New password must be at least 6 characters");
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setLocalError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!validateName() || isSubmitting) return;

    setIsSubmitting(true);
    setLocalError(null);
    setSuccessMessage(null);

    try {
      const response = await editProfile({
        newName: formData.fullName.trim(),
      });

      if (response?.success) {
        setSuccessMessage("Name updated successfully!");
        setTimeout(() => {
          setActiveSection(null);
          setSuccessMessage(null);
        }, 2000);
      } else {
        setLocalError(response?.message || "Failed to update name");
      }
    } catch (err) {
      console.error("Name update failed:", err);
      setLocalError(err?.message || "Failed to update name");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail() || isSubmitting) return;

    setIsSubmitting(true);
    setLocalError(null);
    setSuccessMessage(null);

    try {
      const response = await editProfile({
        newEmail: formData.email.trim(),
      });

      if (response?.success) {
        setSuccessMessage("Email updated successfully!");
        setCurrentEmail(formData.email.trim());
        setTimeout(() => {
          setActiveSection(null);
          setSuccessMessage(null);
        }, 2000);
      } else {
        setLocalError(response?.message || "Failed to update email");
      }
    } catch (err) {
      console.error("Email update failed:", err);
      setLocalError(err?.message || "Failed to update email");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordChange() || isSubmitting) return;

    setIsSubmitting(true);
    setLocalError(null);
    setSuccessMessage(null);

    try {
      const response = await editProfile({
        newPassword: formData.newPassword,
      });

      if (response?.success) {
        setSuccessMessage("Password updated successfully!");
        setFormData((prev) => ({
          ...prev,
          newPassword: "",
          confirmPassword: "",
        }));
        setTimeout(() => {
          setActiveSection(null);
          setSuccessMessage(null);
        }, 2000);
      } else {
        setLocalError(response?.message || "Failed to update password");
      }
    } catch (err) {
      console.error("Password update failed:", err);
      setLocalError(err?.message || "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (!formData.deleteConfirm || isSubmitting) return;

    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);
    setSuccessMessage(null);

    try {
      const response = await editProfile({
        deleteAccount: true,
      });

      if (response?.success) {
        setSuccessMessage("Account deleted successfully. Redirecting...");
        setTimeout(async () => {
          await logout();
          navigate("/", { replace: true });
        }, 2000);
      } else {
        setLocalError(response?.message || "Failed to delete account");
      }
    } catch (err) {
      console.error("Account deletion failed:", err);
      setLocalError(err?.message || "Failed to delete account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ProfileOverview = () => (
    <div className="space-y-6">
      <div className="p-6 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Your Profile
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 py-3 border-b border-white/5">
            <span className="text-white/60 text-sm">Name:</span>
            <span className="font-medium text-lg">
              {authUser?.name || authUser?.fullName || "Not set"}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 py-3">
            <span className="text-white/60 text-sm">Email:</span>
            <span className="font-medium text-lg break-all">
              {currentEmail || "Not set"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setActiveSection("name")}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-95"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          <span>Change Name</span>
        </button>

        <button
          onClick={() => setActiveSection("email")}
          className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-95"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span>Change Email</span>
        </button>

        <button
          onClick={() => setActiveSection("password")}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-95"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Change Password</span>
        </button>

        <button
          onClick={() => setActiveSection("delete")}
          className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-95"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span>Delete Account</span>
        </button>
      </div>
    </div>
  );

  const NameForm = () => (
    <form onSubmit={handleNameSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3 text-white/90">
          Full Name
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Enter your full name"
          disabled={isSubmitting}
          className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 text-white placeholder-white/40 text-lg"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          onClick={handleBackToProfile}
          disabled={isSubmitting}
          className="w-full sm:flex-1 bg-white/5 hover:bg-white/10 border border-white/20 py-4 px-6 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 active:scale-95"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.fullName.trim()}
          className="w-full sm:flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg active:scale-95"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );

  const EmailForm = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3 text-white/90">
          New Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="name@example.com"
          disabled={isSubmitting}
          className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 text-white placeholder-white/40 text-lg"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          onClick={handleBackToProfile}
          disabled={isSubmitting}
          className="w-full sm:flex-1 bg-white/5 hover:bg-white/10 border border-white/20 py-4 px-6 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 active:scale-95"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.email.trim()}
          className="w-full sm:flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg active:scale-95"
        >
          {isSubmitting ? "Updating..." : "Update Email"}
        </button>
      </div>
    </form>
  );

  const PasswordForm = () => (
    <form onSubmit={handlePasswordSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3 text-white/90">
          New Password
        </label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          placeholder="Enter a strong password"
          disabled={isSubmitting}
          className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50 text-white placeholder-white/40 text-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-3 text-white/90">
          Confirm Password
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter your password"
          disabled={isSubmitting}
          className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50 text-white placeholder-white/40 text-lg"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          onClick={handleBackToProfile}
          disabled={isSubmitting}
          className="w-full sm:flex-1 bg-white/5 hover:bg-white/10 border border-white/20 py-4 px-6 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 active:scale-95"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            isSubmitting || !formData.newPassword || !formData.confirmPassword
          }
          className="w-full sm:flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg active:scale-95"
        >
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      </div>
    </form>
  );

  const DeleteForm = () => (
    <form onSubmit={handleDeleteSubmit} className="space-y-6">
      <div className="p-5 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-200">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-sm">
            This action is permanent and cannot be undone. All your data will be
            permanently deleted.
          </span>
        </div>
      </div>

      <label className="flex items-start gap-4 cursor-pointer group">
        <input
          type="checkbox"
          name="deleteConfirm"
          checked={formData.deleteConfirm}
          onChange={handleChange}
          disabled={isSubmitting}
          className="mt-1 h-5 w-5 flex-shrink-0 rounded border-white/30 bg-white/10 text-rose-600 focus:ring-rose-500 focus:ring-offset-0 disabled:opacity-50"
        />
        <span className="text-sm text-white/90 group-hover:text-white transition-colors">
          I understand this action is permanent and I want to delete my account
          along with all associated data.
        </span>
      </label>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          onClick={handleBackToProfile}
          disabled={isSubmitting}
          className="w-full sm:flex-1 bg-white/5 hover:bg-white/10 border border-white/20 py-4 px-6 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 active:scale-95"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.deleteConfirm}
          className="w-full sm:flex-1 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg active:scale-95"
        >
          {isSubmitting ? "Deleting..." : "Permanently Delete"}
        </button>
      </div>
    </form>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "name":
        return <NameForm />;
      case "email":
        return <EmailForm />;
      case "password":
        return <PasswordForm />;
      case "delete":
        return <DeleteForm />;
      default:
        return <ProfileOverview />;
    }
  };

  const getTitle = () => {
    const titles = {
      name: "Change Name",
      email: "Change Email",
      password: "Change Password",
      delete: "Delete Account",
    };
    return titles[activeSection] || "Edit Profile";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-white overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Silk
          speed={5}
          scale={1}
          color="#2ECC71"
          noiseIntensity={1}
          rotation={0}
        />
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 pt-4 pb-2">
        <HeaderNonAuthUser isAuthenticated={!!authUser} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="w-full max-w-lg">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 sm:p-8">
            {/* Title */}
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center">
              {getTitle()}
            </h2>

            {/* Messages */}
            {(error || successMessage) && (
              <div
                className={`mb-6 p-5 rounded-xl ${
                  successMessage
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-200"
                    : "bg-rose-500/20 border border-rose-500/40 text-rose-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {successMessage ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    )}
                  </svg>
                  <span className="text-sm">{successMessage || error}</span>
                </div>
              </div>
            )}

            {/* Content */}
            {renderContent()}

            {/* Back Button */}
            {activeSection && (
              <button
                onClick={handleBackToProfile}
                disabled={isSubmitting}
                className="mt-8 text-blue-400 hover:text-blue-300 flex items-center justify-center mx-auto text-sm disabled:opacity-50 transition-colors active:scale-95"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
