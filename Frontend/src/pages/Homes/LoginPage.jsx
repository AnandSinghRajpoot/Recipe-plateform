import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [user, setUser] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/v1/auth/login", user);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("showReminder", res.data.showReminder);
      alert("Login successful!");
      navigate("/");
    } catch (err) {
      alert("Login failed: " + err.response.data.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] flex items-center justify-center px-4">
      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-[#2A3342] mb-6 text-center">
          Welcome Back
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-orange-500 text-white font-semibold py-2 rounded-lg hover:bg-orange-600 transition"
          >
            Login
          </button>
        </form>
        <p className="text-sm text-center mt-4 text-gray-600">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-orange-500 cursor-pointer hover:underline"
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
