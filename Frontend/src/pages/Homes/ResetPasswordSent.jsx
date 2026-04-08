import React, { useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";

const ResetPasswordSent = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await axios.post("http://localhost:8080/api/v1/auth/forgot-password", {
        identifier: email
      });
      setResent(true);
      setTimeout(() => setResent(false), 3000);
    } catch (err) {
      console.error("Failed to resend:", err);
    } finally {
      setResending(false);
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
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 shadow-[0_24px_48px_rgba(0,110,28,0.12)] border border-white text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl">email</span>
          </div>

          <h1 className="font-headline font-black text-3xl text-on-surface mb-4 tracking-tight">
            Check Your Mail
          </h1>
          
          <p className="text-on-surface-variant font-medium mb-8">
            We've sent a password reset link to{' '}
            <span className="text-primary font-black">{email}</span>
          </p>

          <div className="bg-surface-container-low rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-primary">timer</span>
              <span className="font-bold text-sm">Link expires in 15 minutes</span>
            </div>
          </div>

          {resent && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 text-primary rounded-2xl animate-fade-in">
              <span className="material-symbols-outlined text-lg mr-2">check_circle</span>
              Link sent successfully!
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full py-4 border-2 border-primary/30 text-primary rounded-2xl font-black hover:bg-primary/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {resending ? (
                <div className="w-5 h-5 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined">refresh</span>
                  Resend Link
                </>
              )}
            </button>

            <Link
              to="/forgot-password"
              className="block w-full py-4 text-on-surface-variant font-bold hover:text-primary transition-colors"
            >
              Use different email
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-outline-variant/10">
            <Link to="/login" className="text-primary hover:underline flex items-center justify-center gap-2 font-bold">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Login
            </Link>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        `}} />
      </main>
    </div>
  );
};

export default ResetPasswordSent;