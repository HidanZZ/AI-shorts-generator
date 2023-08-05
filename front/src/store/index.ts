import { configureStore } from "@reduxjs/toolkit";
import apikeys from "./apikeys";
import assets from "./assets";
import job from "./job";
import { combineReducers } from "redux";
import {
	useDispatch as useAppDispatch,
	useSelector as useAppSelector,
	TypedUseSelectorHook,
} from "react-redux";

export const store = configureStore({
	reducer: {
		apikeys,
		assets,
		job,
	},
});

const rootReducer = combineReducers({
	apikeys,
	assets,
	job,
});

export type AppState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export const { dispatch } = store;
export const useDispatch = () => useAppDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<AppState> = useAppSelector;

export default store;
