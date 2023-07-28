"use client";
import Image from "next/image";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Home() {
	const router = useRouter();
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				height: "100vh",
			}}
		>
			<Image src='/vercel.svg' alt='Vercel Logo' width={72} height={16} />
			<Typography variant='h1' component='h1' gutterBottom>
				Welcome to <a href='https://nextjs.org'>Next.js!</a>
			</Typography>
			<Button
				variant='contained'
				color='primary'
				sx={{
					mb: 2,
				}}
				onClick={() => {
					router.push("/generate");
				}}
			>
				Start
			</Button>
		</Box>
	);
}
