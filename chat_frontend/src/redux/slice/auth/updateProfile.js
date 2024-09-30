import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import fetcher from "../../../helper/fetcher";

export const updateProfile = createAsyncThunk(
    'updateProfile',
    (postData, { rejectWithValue }) => {
        return fetcher.put("/auth/update_profile", postData)
            .then((response) => {
                return response.data
            })
            .catch(error => {
                return rejectWithValue(error.response ? error.response.data : 'An error occurred');
            });
    }
);

const updateProfileSlice = createSlice({
    name: "profile",
    initialState: {
        isLoading: false,
        data: null,
        isError: false,
    },
    extraReducers: (builder) => {
        builder.addCase(updateProfile.pending, (state, action) => {
            state.isLoading = true;
        });
        builder.addCase(updateProfile.fulfilled, (state, action) => {
            state.isLoading = false;
            state.data = action.payload;
        });
        builder.addCase(updateProfile.rejected, (state, action) => {
            console.log("Error", action.payload);
            state.isLoading = false;
            state.isError = true;
        });
    },
});

export default updateProfileSlice.reducer;