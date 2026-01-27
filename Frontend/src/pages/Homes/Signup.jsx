import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8080/api/v1/auth/register", user, {
        headers: { "Content-Type": "application/json" },
      });

      alert(response.data?.message || "Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Unknown error occurred";
      alert("Signup failed: " + message);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] flex items-center justify-center px-4">
      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-[#2A3342] mb-6 text-center">
          Create Account
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={user.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={user.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={user.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-orange-500 text-white font-semibold py-2 rounded-lg transition ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-orange-600"
            }`}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-orange-500 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
