import api from "@/lib/axios";
import { ApiKeys } from "@/types";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

type ApiKeysState = {
	loading: boolean;
	error: any;
	keys: any;
};

const initialState: ApiKeysState = {
	loading: false,
	error: null,
	keys: null,
};

export const getKeys = createAsyncThunk(
	"apikeys/getKeys",
	async (_, thunkAPI) => {
		try {
			const res = await api.get("/apikeys");

			return res.data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(err.response.data.message);
		}
	}
);
export const addKey = createAsyncThunk(
	"apikeys/addKey",
	async (data: { key: ApiKeys; value: string | undefined }, thunkAPI) => {
		try {
			const res = await api.post("/apikeys", data);
			thunkAPI.dispatch(getKeys());
			return res.data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(err.response.data.message);
		}
	}
);

const apiKeysSlice = createSlice({
	name: "apikeys",
	initialState,
	reducers: {
		resetError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(getKeys.pending, (state) => {
			state.loading = true;
		});
		builder.addCase(getKeys.fulfilled, (state, action) => {
			state.loading = false;
			state.error = null;
			state.keys = action.payload;
		});
		builder.addCase(getKeys.rejected, (state, action) => {
			state.loading = false;
			if (action.payload) {
				state.error = action.payload;
			} else {
				state.error = action.error.message;
			}
		});
		builder.addCase(addKey.pending, (state) => {
			state.loading = true;
		});
		builder.addCase(addKey.fulfilled, (state, action) => {
			state.loading = false;
			state.error = null;
			state.keys = action.payload;
		});
		builder.addCase(addKey.rejected, (state, action) => {
			state.loading = false;
			if (action.payload) {
				state.error = action.payload;
			} else {
				state.error = action.error.message;
			}
		});
	},
});

export const { resetError } = apiKeysSlice.actions;

export default apiKeysSlice.reducer;
