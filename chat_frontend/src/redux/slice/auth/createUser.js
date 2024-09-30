import fetcher from "../../../helper/fetcher";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const createUser = createAsyncThunk(
    'newUser',
    (postData, { rejectWithValue }) => {
        return fetcher.post("/auth/create_account", postData)
            .then((response) => {
                return response.data
            })
            .catch(error => {
                return rejectWithValue(error.response ? error.response.data : 'An error occurred');
            });
    }
);

const createUserSlice = createSlice({
    name: "newUser",
    initialState: {
        isLoading: false,
        data: null,
        isError: false,
    },
    extraReducers: (builder) => {
        builder.addCase(createUser.pending, (state, action) => {
            state.isLoading = true;
        });
        builder.addCase(createUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.data = action.payload;
        });
        builder.addCase(createUser.rejected, (state, action) => {
            // console.log("Error", action.payload);
            state.isLoading = false;
            state.isError = true;
        });
    },
});

export default createUserSlice.reducer;