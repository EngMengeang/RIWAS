import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { HiMail } from "react-icons/hi";
import { RiLockPasswordFill } from "react-icons/ri";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "../server/authAPI";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn(formData);
      
      // Validate response data
      if (!res.data) {
        throw new Error("No data received from server");
      }

      const { user, accessToken, refreshToken } = res.data;

      // Validate required fields
      if (!user || !accessToken || !refreshToken) {
        throw new Error("Invalid response data from server");
      }

      // Store user data and tokens
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      alert(`Welcome back, ${user.firstName}!`);
      console.log("User data:", user);

      localStorage.setItem("id", user.id)
      
      
      // Navigate based on role
      user.role === "recruiter" ? navigate("/job-listing") : navigate("/view-jobs");
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.error || err.message || "❌ Login failed";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => console.log("Google login clicked");
  const handleMicrosoftLogin = () => console.log("Microsoft login clicked");

  return (
    <div className="w-full min-h-screen flex">
      {/* Left Section */}
      <div className="flex-1 flex flex-col m-2">
        <div className="p-4">
          <Link to="/admin-home">
            <button className="flex items-center gap-2 border border-gray-300 bg-white rounded-full px-6 py-3 text-base font-sans hover:bg-gray-100 hover:-translate-x-0.5 transition-all">
              <IoIosArrowBack size={20} /> Back
            </button>
          </Link>
        </div>
        <div className="flex-1 flex justify-center items-center h-full">
          <img src="./biglogo.png" alt="Logo" className="max-w-[80%] object-contain" />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex flex-col items-center border-l border-gray-200 shadow-lg px-8 py-8">
        <p className="mt-12 mb-8 font-semibold text-2xl">Welcome Back!</p>
        <div className="flex-1 w-full max-w-[450px] flex flex-col">
          <form className="w-full" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-6 w-full">
              <label htmlFor="email" className="block mb-2 font-medium text-gray-800 text-sm">
                Email address
              </label>
              <div className="relative flex items-center">
                <HiMail className="absolute left-4 text-gray-600 text-lg pointer-events-none" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-green-500 focus:shadow-[0_0_0_3px_rgba(66,133,244,0.1)] font-sans"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6 w-full">
              <label htmlFor="password" className="block mb-2 font-medium text-gray-800 text-sm">
                Password
              </label>
              <div className="relative flex items-center">
                <RiLockPasswordFill className="absolute left-4 text-gray-600 text-lg pointer-events-none" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-green-500 focus:shadow-[0_0_0_3px_rgba(66,133,244,0.1)] font-sans"
                />
              </div>
            </div>

            <div className="text-right mb-6">
              <Link to="/forgot-password" className="text-green-500 text-sm hover:text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold text-base hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(66,133,244,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center text-center my-8 text-gray-500">
            <span className="flex-1 border-b border-gray-300"></span>
            <span className="px-4 font-medium text-sm">OR</span>
            <span className="flex-1 border-b border-gray-300"></span>
          </div>

          {/* Social Login */}
          <div className="flex flex-col gap-4 mb-8">
            <button
              className="flex items-center justify-center gap-3 w-full py-3 border border-gray-300 bg-white rounded-lg text-base hover:bg-gray-100 hover:border-gray-400 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all"
              onClick={handleGoogleLogin}
            >
              <FcGoogle size={24} />
              <span className="text-gray-800">Continue with Google</span>
            </button>
            <button
              className="flex items-center justify-center gap-3 w-full py-3 border border-gray-300 bg-white rounded-lg text-base text-gray-600 hover:bg-gray-100 hover:border-gray-400 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all"
              onClick={handleMicrosoftLogin}
            >
              <img src="./microsoft.png" alt="Microsoft" className="w-5 h-5 object-contain" />
              <span>Continue with Microsoft</span>
            </button>
          </div>

          {/* Signup Link */}
          <div className="text-center mt-auto pt-4">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="text-green-500 font-semibold hover:text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
