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
} from "@mui/material";
import React, { useEffect } from "react";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import VoiceSelection from "@/views/components/VoiceSelection";
import BackgroundVidSelection from "@/views/components/BackgroundVidSelection";
import JobStatus from "@/views/components/TestJobProgress";
import api from "@/lib/axios";

export default function Generate() {
	const [jobId, setJobId] = React.useState<string>("");
	const [completed, setCompleted] = React.useState<boolean>(true);
	const schema = yup.object().shape({
		redditQuestion: yup.string().required(),
		redditAnswer: yup.string().required(),
		voice: yup.string().required(),
		video: yup.string().required(),
		useElevenLabs: yup.boolean().required(),
	});
	const defaultValues = {
		redditQuestion: "",
		redditAnswer: "",
		voice: "",
		video: "",
		useElevenLabs: false,
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
	const onSubmit = (data: any) => {
		console.log(data);
		api.post("/generate", data).then((res) => {
			setJobId(res.data.jobId);
			setCompleted(false);
		});
	};

	const useElevenLabs = watch("useElevenLabs") as boolean;
	useEffect(() => {
		console.log("useElevenLabs", Boolean(useElevenLabs));
	}, [useElevenLabs]);

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
									charLimit={1000}
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
				<JobStatus jobId={jobId} setCompleted={setCompleted} />
			</CardContent>
		</Card>
	);
}
