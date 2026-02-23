import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// LOGIN
export const signIn = (data) => API.post("/auth/sign-in", data);

// SIGN UP
export const signUp = (data) => API.post("/auth/sign-up", data);

// REFRESH TOKEN
export const refreshToken = (token) =>
  API.post("/auth/refresh-token", { refreshToken: token });

// LOGOUT
export const logout = () => API.post("/auth/logout");

export default API;
