import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your email or phone number");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:8080/api/v1/auth/forgot-password", { 
        identifier: identifier.trim() 
      });
      setSuccess(true);
      setTimeout(() => navigate(`/reset-password-sent?email=${encodeURIComponent(identifier.trim())}`), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[150px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-secondary-container/20 blur-[120px]"></div>
      </div>

      <main className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 shadow-[0_24px_48px_rgba(0,110,28,0.12)] border border-white">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl vitality-gradient flex items-center justify-center text-white shadow-xl mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl">lock_reset</span>
            </div>
            <h1 className="font-headline font-black text-3xl text-on-surface mb-3 tracking-tight">
              Forgot Password?
            </h1>
            <p className="text-on-surface-variant font-medium">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          {success && (
            <div className="mb-8 p-5 bg-primary/10 border border-primary/20 text-primary rounded-2xl text-center animate-fade-in">
              <span className="material-symbols-outlined text-2xl mb-2 block">check_circle</span>
              <p className="font-black">Reset link sent!</p>
            </div>
          )}

          {error && (
            <div className="mb-8 p-5 bg-error-container text-on-error-container rounded-2xl text-center font-black animate-shake">
              <span className="material-symbols-outlined text-xl mr-2">error</span>
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">
                Email or Phone
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  alternate_email
                </span>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white transition-all text-on-surface font-bold placeholder:text-outline-variant/30"
                  placeholder="Enter your email or phone"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full vitality-gradient text-white py-4 px-8 rounded-2xl font-black text-lg shadow-[0_16px_32px_rgba(0,110,28,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Send Reset Link
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
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

export default ForgotPassword;