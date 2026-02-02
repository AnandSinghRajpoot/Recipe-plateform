import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    axios.get("http://localhost:8080/api/v1/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      setProfile(res.data);
      setLoading(false);
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to load profile");
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#fffaf5] flex justify-center px-4 py-10">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">My Profile</h2>

        {/* Email */}
        <div className="mb-4">
          <p className="text-gray-500 text-sm">Email</p>
          <p className="font-semibold">{profile.email}</p>
        </div>

        {/* Preferences */}
        <div className="mb-4">
          <p className="text-gray-500 text-sm">Diet Preference</p>
          <p className="font-semibold">{profile.dietType}</p>
        </div>

        <div className="mb-6">
          <p className="text-gray-500 text-sm">Skill Level</p>
          <p className="font-semibold">{profile.skillLevel}</p>
        </div>

        {/* Recipes */}
        <div>
          <p className="text-lg font-semibold mb-2">Completed Recipes</p>

          {profile.completedRecipes?.length === 0 ? (
            <p className="text-gray-400">No recipes completed yet</p>
          ) : (
            <ul className="list-disc ml-5 space-y-1">
              {profile.completedRecipes.map((recipe, index) => (
                <li key={index}>{recipe}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
