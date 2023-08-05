import api from "@/lib/axios";
import { Asset } from "@/types";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

type AssetsState = {
	loading: boolean;
	error: any;
	assets: Asset[] | null;
};

const initialState: AssetsState = {
	loading: false,
	error: null,
	assets: null,
};

export const getAssets = createAsyncThunk(
	"assets/getAssets",
	async (_, thunkAPI) => {
		try {
			const res = await api.get("/assets");

			return res.data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(err.response.data.message);
		}
	}
);

export const addAsset = createAsyncThunk(
	"assets/addAsset",
	async (data: { name: string; url: string }, thunkAPI) => {
		try {
			const res = await api.post("/assets", data);
			thunkAPI.dispatch(getAssets());
			return res.data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(err.response.data.message);
		}
	}
);

export const deleteAsset = createAsyncThunk(
	"assets/deleteAsset",
	async (id: string, thunkAPI) => {
		try {
			const res = await api.delete(`/assets/${id}`);
			thunkAPI.dispatch(getAssets());
			return res.data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(err.response.data.message);
		}
	}
);

const assetsSlice = createSlice({
	name: "assets",
	initialState,
	reducers: {
		resetError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(getAssets.pending, (state) => {
			state.loading = true;
		});
		builder.addCase(getAssets.fulfilled, (state, action) => {
			state.loading = false;
			state.error = null;
			state.assets = action.payload;
		});
		builder.addCase(getAssets.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload;
		});
		builder.addCase(addAsset.pending, (state) => {
			state.loading = true;
		});
		builder.addCase(addAsset.fulfilled, (state, action) => {
			state.loading = false;
			state.error = null;
		});
		builder.addCase(addAsset.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload;
		});
		builder.addCase(deleteAsset.pending, (state) => {
			state.loading = true;
		});
		builder.addCase(deleteAsset.fulfilled, (state, action) => {
			state.loading = false;
			state.error = null;
		});
		builder.addCase(deleteAsset.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload;
		});
	},
});

export const { resetError } = assetsSlice.actions;

export default assetsSlice.reducer;
