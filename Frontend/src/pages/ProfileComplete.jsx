import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileComplete = () => {
    const [preferences, setPreferences] = useState({
        dietType: "NO_PREFERENCE",
        skillLevel: "BEGINNER"
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setPreferences({ ...preferences, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login first");
            navigate("/login");
            return;
        }

        try {
            await axios.post("http://localhost:8080/api/v1/auth/complete-profile", preferences, {
                headers: { Authorization: `Bearer ${token}` }
            });
            localStorage.setItem("showReminder", "false");
            alert("Profile completed successfully!");
            navigate("/");
        } catch (err) {
            alert("Failed to complete profile: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="min-h-screen bg-[#fffaf5] flex items-center justify-center px-4 py-12">
            <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-[#2A3342] mb-2">Complete Your Profile</h2>
                    <p className="text-gray-500">Help us personalize your kitchen experience</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Diet Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">
                            Dietary Preference
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {["VEG", "NON_VEG", "VEGAN", "NO_PREFERENCE"].map((type) => (
                                <label key={type} className={`
                                    flex items-center justify-center px-4 py-3 border-2 rounded-xl cursor-pointer transition-all
                                    ${preferences.dietType === type 
                                        ? "border-orange-500 bg-orange-50 text-orange-700" 
                                        : "border-gray-100 hover:border-orange-200 text-gray-600"}
                                `}>
                                    <input
                                        type="radio"
                                        name="dietType"
                                        value={type}
                                        checked={preferences.dietType === type}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <span className="capitalize text-sm font-medium">{type.toLowerCase().replace("_", " ")}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Skill Level */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">
                            Cooking Skill Level
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {["BEGINNER", "INTERMEDIATE", "EXPERT", "UNKNOWN"].map((level) => (
                                <label key={level} className={`
                                    flex items-center justify-center px-4 py-3 border-2 rounded-xl cursor-pointer transition-all
                                    ${preferences.skillLevel === level 
                                        ? "border-orange-500 bg-orange-50 text-orange-700" 
                                        : "border-gray-100 hover:border-orange-200 text-gray-600"}
                                `}>
                                    <input
                                        type="radio"
                                        name="skillLevel"
                                        value={level}
                                        checked={preferences.skillLevel === level}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <span className="capitalize text-sm font-medium">{level.toLowerCase()}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-600 hover:shadow-orange-200 transition duration-300 transform active:scale-[0.98]"
                        >
                            Save Preferences
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="w-full mt-4 text-gray-400 font-medium py-2 hover:text-gray-600 transition"
                        >
                            Complete Later
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileComplete;
