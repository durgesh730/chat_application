import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import fetcher from "../../../helper/fetcher";

export const userLogin = createAsyncThunk(
  'login',
  (postData, { rejectWithValue }) => {
    return fetcher.post("/auth/login", postData)
      .then((response) => {
        if (response?.data?.success) {
          localStorage.setItem("token", JSON.stringify(response.data?.jwt))
        }
        return response.data
      })
      .catch(error => {
        return rejectWithValue(error.response ? error.response.data : 'An error occurred');
      });
  }
);

const loginSlice = createSlice({
  name: "login",
  initialState: {
    isLoading: false,
    data: null,
    isError: false,
  },
  extraReducers: (builder) => {
    builder.addCase(userLogin.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(userLogin.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    });
    builder.addCase(userLogin.rejected, (state, action) => {
      console.log("Error", action.payload);
      state.isLoading = false;
      state.isError = true;
    });
  },
});

export default loginSlice.reducer;