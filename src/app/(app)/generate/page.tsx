"use client";

import CharCountTextfield from "@/views/components/CharCountTextfield";
import { Card, Button, Grid, CardContent, InputLabel } from "@mui/material";
import React from "react";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import VoiceSelection from "@/views/components/VoiceSelection";

export default function Generate() {
	const schema = yup.object().shape({
		redditQuestion: yup.string().required(),
		redditAnswer: yup.string().required(),
		voice: yup.string().required(),
	});
	const defaultValues = {
		redditQuestion: "",
		redditAnswer: "",
		voice: "",
	};

	const {
		control,
		handleSubmit,
		watch,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues,
		mode: "onSubmit",
		resolver: yupResolver(schema),
	});
	return (
		<Card>
			<CardContent>
				<Grid container spacing={3}>
					<Grid item xs={12}>
						<InputLabel
							sx={{
								color: "primary.main",
								mx: 2,
								mb: 1,
							}}
							htmlFor='reddit-question'
						>
							Reddit Question
						</InputLabel>
						<Controller
							name='redditQuestion'
							control={control}
							render={({ field }) => (
								<CharCountTextfield
									sx={{
										mx: 2,
									}}
									fullWidth
									id='reddit-question'
									type='text'
									multiline
									charLimit={300}
									error={Boolean(errors.redditQuestion)}
									helperText={errors.redditQuestion?.message}
									{...field}
								/>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<InputLabel
							sx={{
								color: "primary.main",
								mx: 2,
								mb: 1,
							}}
							htmlFor='reddit-answer'
						>
							Reddit Answer
						</InputLabel>
						<Controller
							name='redditAnswer'
							control={control}
							render={({ field }) => (
								<CharCountTextfield
									sx={{
										mx: 2,
									}}
									fullWidth
									id='reddit-answer'
									type='text'
									multiline
									charLimit={10000}
									error={Boolean(errors.redditAnswer)}
									helperText={errors.redditAnswer?.message}
									{...field}
								/>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Card>
							<InputLabel
								sx={{
									color: "primary.main",
									mx: 2,
									mb: 1,
								}}
								htmlFor='voice'
							>
								Voice
							</InputLabel>
							<Controller
								name='voice'
								control={control}
								render={({ field }) => <VoiceSelection {...field} />}
							/>
						</Card>
					</Grid>
					<Grid item xs={12}>
						<Button
							sx={{
								mx: 2,
							}}
							variant='contained'
							color='primary'
							onClick={handleSubmit((data) => {
								console.log(data);
							})}
						>
							Generate
						</Button>
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
}
