"use client";

import CharCountTextfield from "@/views/components/CharCountTextfield";
import {
	Card,
	Button,
	Grid,
	CardContent,
	InputLabel,
	RadioGroup,
	Radio,
	FormControlLabel,
	Box,
	Checkbox,
} from "@mui/material";
import React, { useEffect } from "react";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import VoiceSelection from "@/views/components/VoiceSelection";
import BackgroundVidSelection from "@/views/components/BackgroundVidSelection";
import JobStatus from "@/views/components/JobProgress";
import api from "@/lib/axios";
import { Job } from "@/types";
import { useDispatch } from "@/store";
import { generate } from "@/store/job";

export default function Generate() {
	const dispatch = useDispatch();
	const schema = yup.object().shape({
		redditQuestion: yup.string().when("useAiGeneratedStory", {
			is: false,
			then(schema) {
				return schema.required();
			},
			otherwise(schema) {
				return schema.default("");
			},
		}),
		redditAnswer: yup.string().when("useAiGeneratedStory", {
			is: false,
			then(schema) {
				return schema.required();
			},
			otherwise(schema) {
				return schema.default("");
			},
		}),

		voice: yup.string().default(""),
		video: yup.string().required(),
		useElevenLabs: yup.boolean().required(),
		useRandomVideoTime: yup.boolean().required().default(false),
		useAiGeneratedStory: yup.boolean().required().default(false),
		isYoutube: yup.boolean().required().default(false),
	});
	const defaultValues: Job = {
		redditQuestion: "",
		redditAnswer: "",
		voice: "",
		video: "",
		useElevenLabs: false,
		useRandomVideoTime: false,
		useAiGeneratedStory: false,
		isYoutube: false,
	};

	const {
		control,
		handleSubmit,
		watch,
		reset,
		getValues,
		formState: { errors },
	} = useForm({
		defaultValues,
		mode: "onSubmit",
		resolver: yupResolver(schema),
	});
	const onSubmit = (data: Job) => {
		dispatch(generate(data));
	};

	const useElevenLabs = watch("useElevenLabs") as boolean;
	const useAiGeneratedStory = watch("useAiGeneratedStory") as boolean;

	return (
		<Card>
			<CardContent>
				<Grid container spacing={3}>
					<Grid item xs={12}>
						<Controller
							name='useAiGeneratedStory'
							control={control}
							render={({ field: { onChange, value } }) => (
								<FormControlLabel
									checked={value}
									onChange={onChange}
									control={<Checkbox />}
									label={"Use AI Generated Story"}
									labelPlacement='start'
									sx={{ ml: 2 }}
								/>
							)}
						/>
						{errors.useAiGeneratedStory && (
							<p>{errors.useAiGeneratedStory.message}</p>
						)}
						<Controller
							name='isYoutube'
							control={control}
							render={({ field: { onChange, value } }) => (
								<FormControlLabel
									checked={value}
									onChange={onChange}
									control={<Checkbox />}
									label={"Youtube Short"}
									labelPlacement='start'
									sx={{ ml: 2 }}
								/>
							)}
						/>
						{errors.isYoutube && <p>{errors.isYoutube.message}</p>}
					</Grid>
					{!useAiGeneratedStory && (
						<>
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
											// charLimit={200}
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
											charLimit={3000}
											error={Boolean(errors.redditAnswer)}
											helperText={errors.redditAnswer?.message}
											{...field}
										/>
									)}
								/>
							</Grid>
						</>
					)}
					<Grid item xs={12}>
						<Card>
							<InputLabel
								sx={{
									color: "primary.main",
									mx: 2,
									mb: 1,
								}}
								htmlFor='audio-strategy'
							>
								Audio Strategy
							</InputLabel>
							<Controller
								name='useElevenLabs'
								control={control}
								render={({ field: { onChange, onBlur, value, ref } }) => (
									<Grid container>
										<Grid item className='fade-in' xs={12} sm={6} md={2}>
											<Card
												sx={{
													display: "flex",
													flexDirection: "column",
													mb: 2,
												}}
											>
												<Box sx={{ display: "flex", alignItems: "center" }}>
													<FormControlLabel
														checked={value === true}
														onChange={(e) => onChange(true)}
														inputRef={ref}
														onBlur={onBlur}
														control={<Radio />}
														label={"Eleven Labs"}
														labelPlacement='start'
														sx={{ ml: 0 }}
													/>
												</Box>
											</Card>
										</Grid>
										<Grid item className='fade-in' xs={12} sm={6} md={2}>
											<Card
												sx={{
													display: "flex",
													flexDirection: "column",
													mb: 2,
												}}
											>
												<Box sx={{ display: "flex", alignItems: "center" }}>
													<FormControlLabel
														checked={value === false}
														onChange={(e) => onChange(false)}
														inputRef={ref}
														onBlur={onBlur}
														control={<Radio />}
														label={"Edge TTS"}
														labelPlacement='start'
														sx={{ ml: 0 }}
													/>
												</Box>
											</Card>
										</Grid>
									</Grid>
								)}
							/>
						</Card>
					</Grid>
					{useElevenLabs && (
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
					)}
					<Grid item xs={12}>
						<Card>
							<InputLabel
								sx={{
									color: "primary.main",
									mx: 2,
									mb: 1,
								}}
								htmlFor='video'
							>
								Background Video
							</InputLabel>
							<Controller
								name='video'
								control={control}
								render={({ field }) => <BackgroundVidSelection {...field} />}
							/>
						</Card>
					</Grid>
					<Grid item xs={12}>
						<Controller
							name='useRandomVideoTime'
							control={control}
							render={({ field: { onChange, value } }) => (
								<FormControlLabel
									checked={value}
									onChange={onChange}
									control={<Checkbox />}
									label={"Randomize Video Start Time"}
									labelPlacement='start'
									sx={{ ml: 2 }}
								/>
							)}
						/>
						{errors.useRandomVideoTime && (
							<p>{errors.useRandomVideoTime.message}</p>
						)}
					</Grid>
					<Grid item xs={12}>
						<Button
							sx={{
								mx: 2,
							}}
							// disabled={!completed}
							variant='contained'
							color='primary'
							onClick={handleSubmit((data) => {
								console.log(data);

								onSubmit(data);
							})}
						>
							Generate
						</Button>
					</Grid>
				</Grid>
				<JobStatus />
			</CardContent>
		</Card>
	);
}
