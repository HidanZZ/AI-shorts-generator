import React, { useEffect, useState } from "react";
import {
	Box,
	Card,
	FormControl,
	FormControlLabel,
	IconButton,
	Radio,
	Grid,
	RadioGroup,
	Button,
	useMediaQuery,
	Theme,
} from "@mui/material";
import { toast } from "react-hot-toast";
import api from "@/lib/axios";

type Video = {
	id: string;
	name: string;
	url: string;
};

function BackgroundVidSelection({
	value,
	onChange,
}: {
	value: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
	const [videos, setVideos] = useState<Video[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [displayCount, setDisplayCount] = useState(0);
	const [amountToDisplay, setAmountToDisplay] = useState(5);
	const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));
	const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("sm"));
	const xsUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("xs"));
	useEffect(() => {
		let tempAmountToDisplay;
		if (mdUp) {
			tempAmountToDisplay = 6;
		} else if (smUp) {
			tempAmountToDisplay = 4;
		} else if (xsUp) {
			tempAmountToDisplay = 2;
		} else {
			tempAmountToDisplay = 1;
		}
		setAmountToDisplay(tempAmountToDisplay);
		if (displayCount === 0) setDisplayCount(tempAmountToDisplay);
	}, [mdUp, smUp, xsUp, displayCount]);

	useEffect(() => {
		// 👨‍💻 Replace this URL with the actual endpoint to fetch the data
		const url = "/settings/assets";

		api
			.get(url)
			.then((response) => {
				setVideos(response.data.assets);
				setLoading(false);
				if (response.data.assets.length > 0) {
					onChange({
						target: {
							value: response.data.assets[0].id,
						},
					} as React.ChangeEvent<HTMLInputElement>);
				}
			})
			.catch((error) => {
				toast.error("Error fetching videos");
				setError(
					"Error fetching videos, please go to assets page and add videos"
				);
			});
	}, []);

	const handleShowMore = () => {
		setDisplayCount((currentCount) => currentCount + amountToDisplay);
	};
	const handleShowLess = () => {
		setDisplayCount((currentCount) =>
			Math.max(currentCount - amountToDisplay, amountToDisplay)
		);
	};
	const handleCardClick = (id: string) => {
		onChange({
			target: {
				value: id,
			},
		} as React.ChangeEvent<HTMLInputElement>);
	};
	return (
		<FormControl component='fieldset' fullWidth>
			<Grid
				container
				component={RadioGroup}
				aria-label='voice'
				name='voice'
				value={value}
				onChange={onChange}
			>
				{videos.slice(0, displayCount).map((video) => (
					<Grid item key={video.id} className='fade-in' xs={12} sm={6} md={2}>
						<Card
							sx={{
								display: "flex",
								flexDirection: "column",
								mb: 2,
								cursor: "pointer",
							}}
							onClick={() => {
								handleCardClick(video.id);
							}}
						>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<FormControlLabel
									value={video.id}
									control={<Radio />}
									label={video.name}
									labelPlacement='start'
									sx={{ ml: 0 }}
								/>
							</Box>
						</Card>
					</Grid>
				))}
			</Grid>
			{error && (
				<Box
					sx={{
						color: "red",
						mx: 2,
					}}
				>
					{error}
				</Box>
			)}
			{videos.length != 0 && (
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						mt: 2,
					}}
				>
					{displayCount < videos.length && (
						<Button sx={{ mx: 2 }} onClick={handleShowMore}>
							Show More
						</Button>
					)}
					{displayCount > amountToDisplay && (
						<Button sx={{ mx: 2 }} onClick={handleShowLess}>
							Show Less
						</Button>
					)}
				</Box>
			)}
		</FormControl>
	);
}

export default BackgroundVidSelection;
