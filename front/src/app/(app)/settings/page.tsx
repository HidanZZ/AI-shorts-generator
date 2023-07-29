"use client";
import {
	Box,
	Card,
	CardContent,
	Button,
	Grid,
	IconButton,
	InputLabel,
	TextField,
	Skeleton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "@/lib/axios";
type ApiKey = {
	elevenLabsApiKey: string;
};

export default function Settings() {
	const [apiKey, setApiKey] = useState<ApiKey | null>(null);
	const [showApiKey, setShowApiKey] = useState(false);
	const [Loading, setLoading] = useState(true);

	useEffect(() => {
		api
			.get("/settings/apikey")
			.then((res) => {
				setApiKey(res.data);
				setLoading(false);
			})
			.catch((err) => {
				setLoading(false);
			});
	}, []);

	const handleSave = async () => {
		api
			.post("/settings/apikey", apiKey)
			.then(() => {
				toast.success("Saved API Key");
			})
			.catch((err) => {
				toast.error("Failed to save API Key");
				console.error(err);
			});
	};
	const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setApiKey({
			...apiKey,
			elevenLabsApiKey: event.target.value,
		});
	};
	return (
		<Card>
			<CardContent>
				<Grid container spacing={3}>
					<Grid item xs={12}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<InputLabel
								sx={{
									color: "primary.main",
									mx: 2,
								}}
								htmlFor='my-input'
							>
								Eleven Labs API Key
							</InputLabel>
							{Loading ? (
								<Skeleton
									variant='rectangular'
									height={56}
									sx={{
										flexGrow: 1,
									}}
								/>
							) : (
								<>
									<TextField
										sx={{
											mx: 2,
											flexGrow: 1,
										}}
										id='my-input'
										type={showApiKey ? "text" : "password"}
										aria-describedby='my-helper-text'
										value={apiKey?.elevenLabsApiKey ?? ""}
										onChange={handleApiKeyChange}
									/>
									<Box>
										<IconButton
											sx={{
												mx: 2,
											}}
											onClick={() => setShowApiKey(!showApiKey)}
										>
											{showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
										</IconButton>
										<Button
											variant='contained'
											sx={{
												mx: 2,
											}}
											onClick={handleSave}
										>
											Save
										</Button>
									</Box>
								</>
							)}
						</Box>
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
}
