// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const Login = () => {
//   const [user, setUser] = useState({ email: "", password: "" });
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setUser({ ...user, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post("http://localhost:8080/api/v1/auth/login", user);
//       // localStorage.setItem("token", res.data.token);
//       // localStorage.setItem("showReminder", res.data.showReminder);
//       // alert("Login successful!");
//       // navigate("/");
//       const showReminder = String(res.data.showReminder);

// localStorage.setItem("token", res.data.token);
// localStorage.setItem("showReminder", showReminder);

// alert("Login successful!");

// if (showReminder === "true") {
//   navigate("/profile/complete");
// } else {
//   navigate("/");
// }

//     } catch (err) {
//       alert("Login failed: " + err.response.data.message);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#fffaf5] flex items-center justify-center px-4">
//       <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md">
//         <h2 className="text-3xl font-bold text-[#2A3342] mb-6 text-center">
//           Welcome Back
//         </h2>
//         <form onSubmit={handleSubmit}>
//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             onChange={handleChange}
//             className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 outline-none focus:ring-2 focus:ring-orange-400"
//             required
//           />
//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             onChange={handleChange}
//             className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 outline-none focus:ring-2 focus:ring-orange-400"
//             required
//           />
//           <button
//             type="submit"
//             className="w-full bg-orange-500 text-white font-semibold py-2 rounded-lg hover:bg-orange-600 transition"
//           >
//             Login
//           </button>
//         </form>
//         <p className="text-sm text-center mt-4 text-gray-600">
//           Don’t have an account?{" "}
//           <span
//             onClick={() => navigate("/signup")}
//             className="text-orange-500 cursor-pointer hover:underline"
//           >
//             Sign Up
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;


import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [user, setUser] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    if (errors[e.target.name] || errors.form) {
      setErrors({ ...errors, [e.target.name]: "", form: "" });
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!user.email || !emailRegex.test(user.email)) {
      newErrors.email = "Please enter a valid email format";
    }
    if (!user.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8080/api/v1/auth/login",
        user
      );

      /*
        BACKEND RESPONSE EXPECTED:
        {
          token: "...",
          showReminder: true | false   (may be missing)
        }
      */

      // ✅ normalize showReminder (VERY IMPORTANT)
      const showReminder = String(res.data.showReminder ?? true);

      // ✅ save to localStorage
      localStorage.setItem("token", res.data.token);
      setSuccess("Login successful! Redirecting...");
      setErrors({});
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setErrors({ ...errors, form: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-bold text-[#2A3342] mb-2 text-center">
          Welcome Back
        </h2>
        <p className="text-gray-500 text-center mb-8">Good to see you again!</p>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-xl text-center font-medium animate-pulse">
            {success}
          </div>
        )}

        {errors.form && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-center font-medium">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={user.email}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-3 outline-none transition focus:ring-2 focus:ring-orange-400 ${
                errors.email ? "border-red-500 ring-1 ring-red-200" : "border-gray-200"
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={user.password}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-3 outline-none transition focus:ring-2 focus:ring-orange-400 pr-12 ${
                errors.password ? "border-red-500 ring-1 ring-red-200" : "border-gray-200"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
            {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-orange-500 text-white font-bold py-3 rounded-lg transition mt-4 ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-orange-600 shadow-md"
            }`}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-600">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-orange-500 font-bold cursor-pointer hover:underline ml-1"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
