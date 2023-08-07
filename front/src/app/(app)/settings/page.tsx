"use client";
import { Card, CardContent, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "@/store";
import { getKeys } from "@/store/apikeys";
import ApiKeyInput from "@/views/components/ApiKeyInput";
import { API_KEYS } from "@/constants/keys";
import { toast } from "react-hot-toast";

export default function Settings() {
	const dispatch = useDispatch();
	const { error } = useSelector((state) => state.apikeys);

	useEffect(() => {
		dispatch(getKeys());
	}, []);

	useEffect(() => {
		if (error) {
			console.log(error);
			toast.error(error.message ?? "An error occured");
		}
	}, [error]);

	return (
		<Card>
			<CardContent>
				<Grid container spacing={3}>
					<Grid item xs={12}>
						<ApiKeyInput
							label='ElevenLabs API Key'
							apiKey={API_KEYS.ELEVENLABS}
						/>
					</Grid>
					<Grid item xs={12}>
						<ApiKeyInput label='OpenAI API Key' apiKey={API_KEYS.OPENAI} />
					</Grid>
					<Grid item xs={12}>
						<ApiKeyInput label='Claude Session key' apiKey={API_KEYS.CLAUDE} />
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
}
