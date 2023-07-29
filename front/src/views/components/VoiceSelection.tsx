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
	Skeleton,
} from "@mui/material";
import { toast } from "react-hot-toast";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import api from "@/lib/axios";

type Voice = {
	voice_id: string;
	name: string;
	preview_url: string;
};

function VoiceSelection({
	value,
	onChange,
}: {
	value: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
	const [voices, setVoices] = useState<Voice[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
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
		const url = "/voices";

		api
			.get(url)
			.then((response) => {
				setVoices(response.data.voices);
				setLoading(false);
				if (response.data.voices.length > 0) {
					onChange({
						target: {
							value: response.data.voices[0].voice_id,
						},
					} as React.ChangeEvent<HTMLInputElement>);
				}
			})
			.catch((error) => {
				toast.error("Error fetching voices");
				setError(
					"Error fetching voices, please check the api key in settings and try again"
				);
			});
	}, []);

	const handlePlay = (url: string) => {
		if (audio) {
			audio.pause();
		}
		const newAudio = new Audio(url);
		setAudio(newAudio);
		newAudio.play();
	};
	const handleShowMore = () => {
		setDisplayCount((currentCount) => currentCount + amountToDisplay);
	};
	const handleShowLess = () => {
		setDisplayCount((currentCount) =>
			Math.max(currentCount - amountToDisplay, amountToDisplay)
		);
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
				{loading && (
					<Skeleton variant='rectangular' width='100%' height='100px' />
				)}
				{voices.slice(0, displayCount).map((voice) => (
					<Grid
						item
						key={voice.voice_id}
						className='fade-in'
						xs={12}
						sm={6}
						md={2}
					>
						<Card sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<IconButton onClick={() => handlePlay(voice.preview_url)}>
									<PlayArrowIcon fontSize='small' />
								</IconButton>
								<FormControlLabel
									value={voice.voice_id}
									control={<Radio />}
									label={voice.name}
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
			{voices.length != 0 && (
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						mt: 2,
					}}
				>
					{displayCount < voices.length && (
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

export default VoiceSelection;
