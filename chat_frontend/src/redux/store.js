import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./slice/auth/login";
import updateProfile from "./slice/auth/updateProfile";
import createUser from "./slice/auth/createUser";

export const store = configureStore({
  reducer: {
    login: loginReducer,
    profile: updateProfile,
    newUser: createUser,
  },
});