import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { MdEmail, MdLock, MdPerson } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { signUp } from "../../server/authAPI";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Split fullName into firstName and lastName
    const names = formData.fullName.trim().split(" ");
    const firstName = names[0];
    const lastName = names.slice(1).join(" ") || "_";

    const payload = {
      firstName,
      lastName,
      email: formData.email,
      password: formData.password,
      role: "candidate", // default role
    };

    try {
      const res = await signUp(payload);
      const { user, accessToken, refreshToken } = res.data;

      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      alert(`Welcome, ${user.firstName}!`);
      navigate("/viewjob"); // candidate default page
    } catch (err) {
      alert(err.response?.data?.errors?.[0]?.message || "Sign up failed");
    }
  };

  const handleGoogleLogin = () => console.log("Google login clicked");
  const handleMicrosoftLogin = () => console.log("Microsoft login clicked");

  return (
    <div className="w-full min-h-screen flex">
      {/* Left Section */}
      <div className="flex-1 flex flex-col m-2">
        <div className="p-4">
          <Link to="/">
            <button className="flex items-center gap-2 border border-gray-300 bg-white rounded-full px-6 py-3 text-base font-sans hover:bg-gray-100 hover:-translate-x-0.5 transition-all">
              <IoIosArrowBack size={20} /> Back
            </button>
          </Link>
        </div>
        <div className="flex-1 flex justify-center items-center h-full">
          <img
            src="./biglogo.png"
            alt="Logo"
            className="max-w-[80%] object-contain"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex flex-col items-center border-l border-gray-200 shadow-lg px-8 py-8">
        <p className="mt-12 mb-8 font-semibold text-2xl">Create an account</p>

        <div className="flex-1 w-full max-w-[450px] flex flex-col">
          <form className="w-full" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="mb-6 w-full">
              <label
                htmlFor="fullName"
                className="block mb-2 font-medium text-gray-800 text-sm"
              >
                Full Name
              </label>
              <div className="relative flex items-center">
                <MdPerson className="absolute left-4 text-gray-600 text-lg pointer-events-none" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-green-500 focus:shadow-[0_0_0_3px_rgba(66,133,244,0.1)] font-sans"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-6 w-full">
              <label
                htmlFor="email"
                className="block mb-2 font-medium text-gray-800 text-sm"
              >
                Email address
              </label>
              <div className="relative flex items-center">
                <MdEmail className="absolute left-4 text-gray-600 text-lg pointer-events-none" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-green-500 focus:shadow-[0_0_0_3px_rgba(66,133,244,0.1)] font-sans"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6 w-full">
              <label
                htmlFor="password"
                className="block mb-2 font-medium text-gray-800 text-sm"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <MdLock className="absolute left-4 text-gray-600 text-lg pointer-events-none" />
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

            {/* Confirm Password */}
            <div className="mb-6 w-full">
              <label
                htmlFor="confirmPassword"
                className="block mb-2 font-medium text-gray-800 text-sm"
              >
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <MdLock className="absolute left-4 text-gray-600 text-lg pointer-events-none" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-green-500 focus:shadow-[0_0_0_3px_rgba(66,133,244,0.1)] font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold text-base hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(66,133,244,0.3)] transition-all"
            >
              Create Account
            </button>

            <p className="text-gray-500 text-xs text-center mt-4">
              By signing up, you agree to RIWAS{" "}
              <Link
                to="/terms"
                className="text-green-500 font-medium hover:text-green-600 hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-green-500 font-medium hover:text-green-600 hover:underline"
              >
                Privacy Policy
              </Link>
            </p>
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
              <img
                src="./microsoft.png"
                alt="Microsoft"
                className="w-5 h-5 object-contain"
              />
              <span>Continue with Microsoft</span>
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-auto pt-4">
            <p className="text-gray-600 text-sm">
              Have an account?{" "}
              <Link
                to="/login"
                className="text-green-500 font-semibold hover:text-blue-600 hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
