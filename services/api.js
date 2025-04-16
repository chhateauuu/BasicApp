import axios from "axios";

const API = axios.create({ baseURL: "https://dementia-backend-gamma.vercel.app/api/auth" });

export const signup = (data) => API.post("/signup", data);
export const login = (data) => API.post("/login", data);
export const getUserId = (data) => API.post("/get-user-id", data);

