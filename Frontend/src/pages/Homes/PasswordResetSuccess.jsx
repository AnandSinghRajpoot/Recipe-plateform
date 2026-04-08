import React from "react";
import { Link } from "react-router-dom";

const PasswordResetSuccess = () => {
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[150px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-secondary-container/20 blur-[120px]"></div>
      </div>

      <main className="relative z-10 w-full max-w-md text-center">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 shadow-[0_24px_48px_rgba(0,110,28,0.12)] border border-white">
          {/* Success Animation */}
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white shadow-2xl mx-auto mb-8 animate-bounce">
            <span className="material-symbols-outlined text-5xl">check</span>
          </div>

          <h1 className="font-headline font-black text-4xl text-on-surface mb-4">
            Password Updated!
          </h1>
          
          <p className="text-on-surface-variant font-medium mb-8">
            Your password has been reset successfully. You can now login with your new password.
          </p>

          <div className="bg-primary/10 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center gap-3 text-primary">
              <span className="material-symbols-outlined">verified_user</span>
              <span className="font-black">Account Secured</span>
            </div>
          </div>

          <Link
            to="/login"
            className="block w-full vitality-gradient text-white py-5 px-8 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Login Now
          </Link>

          <div className="mt-8 pt-6 border-t border-outline-variant/10">
            <p className="text-on-surface-variant text-sm">
              Forgot password again?{' '}
              <Link to="/forgot-password" className="text-primary font-black hover:underline">
                Reset here
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PasswordResetSuccess;