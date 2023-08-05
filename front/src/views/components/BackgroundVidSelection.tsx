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
import api from "@/lib/axios";
import { useDispatch, useSelector } from "@/store";
import { getAssets } from "@/store/assets";

function BackgroundVidSelection({
	value,
	onChange,
}: {
	value: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
	const { assets, loading } = useSelector((state) => state.assets);
	const dispatch = useDispatch();
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
		dispatch(getAssets());
	}, []);

	useEffect(() => {
		if (assets) {
			if (assets.length === 0) {
				setError("No Background Videos Found");
			} else {
				setError(null);
				onChange({
					target: {
						value: assets[0]._id,
					},
				} as React.ChangeEvent<HTMLInputElement>);
			}
		}
	}, [assets, onChange]);

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
				{loading && (
					<Skeleton variant='rectangular' width='100%' height='100px' />
				)}
				{assets &&
					assets.slice(0, displayCount).map((video) => (
						<Grid
							item
							key={video._id}
							className='fade-in'
							xs={12}
							sm={6}
							md={2}
						>
							<Card
								sx={{
									display: "flex",
									flexDirection: "column",
									mb: 2,
									cursor: "pointer",
								}}
								onClick={() => {
									handleCardClick(video._id);
								}}
							>
								<Box sx={{ display: "flex", alignItems: "center" }}>
									<FormControlLabel
										value={video._id}
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
			{assets && assets.length != 0 && (
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						mt: 2,
					}}
				>
					{displayCount < assets.length && (
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
