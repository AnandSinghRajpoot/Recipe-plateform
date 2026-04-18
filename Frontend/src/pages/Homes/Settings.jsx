import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import apiClient from "../../utils/apiClient";
import generalProfilePic from "../../assets/general-profile-pic.png";
import { resolveImageUrl } from "../../utils/imageUtils";

const Settings = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("account");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Notification toggles
  const [notifications, setNotifications] = useState({
    emailRecipes: true,
    emailNews: false,
    pushNewFollower: true,
    pushComments: true
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    apiClient.get("/auth/profile")
    .then(res => {
      setProfile(res.data);
      setLoading(false);
    })
    .catch(() => {
      setLoading(false);
    });
  }, [navigate]);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 6) strength += 25;
    if (pwd.length >= 10) strength += 15;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 20;
    if (/[0-9]/.test(pwd)) strength += 20;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 20;
    return Math.min(100, strength);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    if (!passwords.currentPassword) {
      setError("Current password is required");
      return;
    }
    if (!passwords.newPassword) {
      setError("New password is required");
      return;
    }
    if (passwords.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!/^(?=.*[0-9])(?=.*[a-zA-Z]).+$/.test(passwords.newPassword)) {
      setError("Must contain at least one digit and one letter");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await apiClient.post("/auth/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setSuccess("Password updated successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePhoto", file);

    setUploading(true);
    try {
      const res = await apiClient.post("/auth/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(prev => ({ ...prev, profilePhoto: res.data }));
      toast.success("Photo updated successfully!");
    } catch (err) {
      toast.error("Failed to update photo");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const tabs = [
    { id: "account", label: "Account", icon: "person" },
    { id: "notifications", label: "Notifications", icon: "notifications" },
    { id: "privacy", label: "Privacy", icon: "security" }
  ];

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/profile" className="p-2 hover:bg-surface-container-low rounded-xl transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-headline font-black text-3xl">Settings</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? "vitality-gradient text-white shadow-lg" 
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="space-y-6">
            {/* Profile Photo Section */}
            <div className="bg-white rounded-[2rem] p-6 shadow-lg">
              <h2 className="font-headline font-black text-xl mb-6">Profile Photo</h2>
              
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-container-low border-2 border-white shadow-lg">
                    <img 
                      src={profile?.profilePhoto ? resolveImageUrl(profile.profilePhoto) : generalProfilePic} 
                      className="w-full h-full object-cover" 
                      alt="Profile" 
                    />
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <button
                    onClick={handlePhotoClick}
                    disabled={uploading}
                    className="bg-surface-container-low hover:bg-surface-container-high text-on-surface px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    Change Photo
                  </button>
                  <p className="text-xs text-on-surface-variant mt-2">JPG, PNG or GIF. Max 5MB.</p>
                </div>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="bg-white rounded-[2rem] p-6 shadow-lg">
              <h2 className="font-headline font-black text-xl mb-6">Change Password</h2>
              
              {success && (
                <div className="mb-6 p-4 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center gap-2">
                  <span className="material-symbols-outlined">check_circle</span>
                  {success}
                </div>
              )}
              
              {error && (
                <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-2xl animate-shake">
                  <span className="material-symbols-outlined text-sm mr-2">error</span>
                  {error}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">Current Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      className="w-full pl-12 pr-12 py-4 bg-surface-container-low rounded-2xl font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant"
                    >
                      <span className="material-symbols-outlined">{showPasswords.current ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">New Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      className="w-full pl-12 pr-12 py-4 bg-surface-container-low rounded-2xl font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant"
                    >
                      <span className="material-symbols-outlined">{showPasswords.new ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                  {passwords.newPassword && (
                    <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          getPasswordStrength(passwords.newPassword) < 40 ? "bg-error" :
                          getPasswordStrength(passwords.newPassword) < 70 ? "bg-yellow-500" : "bg-primary"
                        }`}
                        style={{ width: `${getPasswordStrength(passwords.newPassword)}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">Confirm New Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">enhanced_encryption</span>
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      className="w-full pl-12 pr-12 py-4 bg-surface-container-low rounded-2xl font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant"
                    >
                      <span className="material-symbols-outlined">{showPasswords.confirm ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full vitality-gradient text-white py-4 rounded-2xl font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : "Update Password"}
                </button>
              </form>
            </div>

            {/* Forgot Password Link */}
            <Link 
              to="/forgot-password"
              className="block text-center text-primary font-bold hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-[2rem] p-6 shadow-lg space-y-4">
            <h2 className="font-headline font-black text-xl mb-6">Notification Settings</h2>
            
            {[
              { key: "emailRecipes", label: "Daily Recipe Recommendations", desc: "Get personalized recipes in your inbox" },
              { key: "emailNews", label: "News & Updates", desc: "Latest features and community news" },
              { key: "pushNewFollower", label: "New Followers", desc: "When someone follows you" },
              { key: "pushComments", label: "Comments & Mentions", desc: "When someone comments on your recipes" }
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
                <div>
                  <p className="font-bold text-on-surface">{item.label}</p>
                  <p className="text-xs text-on-surface-variant">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                  className={`w-14 h-8 rounded-full transition-all ${
                    notifications[item.key] ? "bg-primary" : "bg-surface-container-high"
                  }`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    notifications[item.key] ? "translate-x-7" : "translate-x-1"
                  }`} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === "privacy" && (
          <div className="bg-white rounded-[2rem] p-6 shadow-lg space-y-4">
            <h2 className="font-headline font-black text-xl mb-6">Privacy Controls</h2>
            
            <div className="p-4 bg-surface-container-low rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold">Profile Visibility</span>
                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-black">Public</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold">Show Email</span>
                <button className="w-12 h-6 bg-surface-container-high rounded-full relative">
                  <div className="w-4 h-4 bg-primary rounded-full absolute left-1 top-1"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold">Show Recipes</span>
                <button className="w-12 h-6 bg-primary rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </button>
              </div>
            </div>

            <Link to="/profile" className="block text-center text-primary font-bold hover:underline pt-4">
              Manage Profile Data
            </Link>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full mt-8 py-4 text-error font-bold hover:bg-error/5 rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">logout</span>
          Sign Out
        </button>
      </div>

      <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}} />
    </div>
  );
};

export default Settings;