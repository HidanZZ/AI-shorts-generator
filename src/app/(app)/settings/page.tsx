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
type ApiKey = {
	elevenLabsApiKey: string;
};
const getApiKey = async (): Promise<any> => {
	const data = await fetch("/api/config/apikeys", {
		cache: "no-cache",
	});
	const keys: ApiKey = await data.json();

	return keys;
};

export default function Settings() {
	const [apiKey, setApiKey] = useState<ApiKey | null>(null);
	const [showApiKey, setShowApiKey] = useState(false);
	const [Loading, setLoading] = useState(true);

	useEffect(() => {
		getApiKey().then((keys: ApiKey) => {
			setApiKey(keys);
			setLoading(false);
		});
	}, []);

	const handleSave = async () => {
		await fetch("/api/config/apikeys", {
			method: "POST",
			body: JSON.stringify(apiKey),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.message === "ok") {
					toast.success("API Key saved");
				}
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
