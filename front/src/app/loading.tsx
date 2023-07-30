import { Box, Skeleton } from "@mui/material";

export default function Loading() {
	// You can add any UI inside Loading, including a Skeleton.
	return (
		<Box
			sx={{
				p: { xs: 2, sm: 3, md: 4 },
			}}
		>
			<Skeleton variant='rectangular' width='100%' height={118} />
			{/* <Skeleton variant="circular" width={40} height={40} /> */}
		</Box>
	);
}
