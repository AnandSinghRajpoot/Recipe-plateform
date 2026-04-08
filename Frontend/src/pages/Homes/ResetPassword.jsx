import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError("Invalid reset link");
    } else {
      axios.get(`http://localhost:8080/api/v1/auth/validate-token?token=${token}`)
        .catch(() => {
          setTokenValid(false);
          setError("This reset link has expired or is invalid");
        });
    }
  }, [token]);

  const getPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 6) strength += 25;
    if (pwd.length >= 10) strength += 15;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 20;
    if (/[0-9]/.test(pwd)) strength += 20;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 20;
    return Math.min(100, strength);
  };

  const getStrengthColor = (strength) => {
    if (strength < 40) return "bg-error";
    if (strength < 70) return "bg-yellow-500";
    return "bg-primary";
  };

  const getStrengthLabel = (strength) => {
    if (strength < 40) return "Weak";
    if (strength < 70) return "Medium";
    if (strength < 90) return "Strong";
    return "Very Strong";
  };

  const passwordStrength = getPasswordStrength(passwords.newPassword);

  const validatePassword = () => {
    const newErrors = {};
    if (!passwords.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwords.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    } else if (!/^(?=.*[0-9])(?=.*[a-zA-Z]).+$/.test(passwords.newPassword)) {
      newErrors.newPassword = "Must contain at least one digit and one letter";
    }

    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validatePassword();
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:8080/api/v1/auth/reset-password", {
        token,
        newPassword: passwords.newPassword
      });
      setSuccess(true);
      setTimeout(() => navigate("/password-reset-success"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center p-6">
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 shadow-xl border border-white">
            <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center text-error mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">error</span>
            </div>
            <h1 className="font-headline font-black text-3xl text-on-surface mb-4">Invalid Link</h1>
            <p className="text-on-surface-variant font-medium mb-8">{error}</p>
            <Link to="/forgot-password" className="vitality-gradient text-white py-4 px-8 rounded-2xl font-black inline-block">
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[150px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-secondary-container/20 blur-[120px]"></div>
      </div>

      <main className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 shadow-[0_24px_48px_rgba(0,110,28,0.12)] border border-white">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl vitality-gradient flex items-center justify-center text-white shadow-xl mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl">lock</span>
            </div>
            <h1 className="font-headline font-black text-3xl text-on-surface mb-3">Reset Password</h1>
            <p className="text-on-surface-variant font-medium">Enter your new password below.</p>
          </div>

          {success && (
            <div className="mb-8 p-5 bg-primary/10 border border-primary/20 text-primary rounded-2xl text-center animate-fade-in">
              <span className="material-symbols-outlined text-2xl mb-2 block">check_circle</span>
              <p className="font-black">Password reset!</p>
            </div>
          )}

          {error && !success && (
            <div className="mb-8 p-5 bg-error-container text-on-error-container rounded-2xl text-center font-black animate-shake">
              <span className="material-symbols-outlined text-xl mr-2">error</span>
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">
                New Password
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full pl-14 pr-14 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white transition-all text-on-surface font-bold"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>

              {passwords.newPassword && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">Password strength:</span>
                    <span className={`font-black ${passwordStrength < 40 ? 'text-error' : passwordStrength < 70 ? 'text-yellow-500' : 'text-primary'}`}>
                      {getStrengthLabel(passwordStrength)}
                    </span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStrengthColor(passwordStrength)} transition-all duration-300 rounded-full`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">
                Confirm Password
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary">
                  enhanced_encryption
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full pl-14 pr-6 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white transition-all text-on-surface font-bold"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full vitality-gradient text-white py-4 px-8 rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Update Password"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-primary hover:underline flex items-center justify-center gap-2 font-bold">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Login
            </Link>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
          @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
          .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
        `}} />
      </main>
    </div>
  );
};

export default ResetPassword;