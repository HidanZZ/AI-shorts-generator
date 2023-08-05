import api from "@/lib/axios";
import { Job } from "@/types";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

type JobState = {
	loading: boolean;
	error: any;
	jobId: string | null;
};

const initialState: JobState = {
	loading: false,
	error: null,
	jobId: null,
};

export const generate = createAsyncThunk(
	"job/generate",
	async (data: Job, thunkAPI) => {
		try {
			const res = await api.post("/job/generate", data);
			const jobId = res.data.jobId;
			return res.data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(err.response.data.message);
		}
	}
);

const jobSlice = createSlice({
	name: "job",
	initialState,
	reducers: {
		resetError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(generate.pending, (state) => {
			state.loading = true;
		});
		builder.addCase(generate.fulfilled, (state, action) => {
			state.loading = false;
			state.error = null;
			state.jobId = action.payload.jobId;
		});
		builder.addCase(generate.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload;
		});
	},
});

export const { resetError } = jobSlice.actions;

export default jobSlice.reducer;
