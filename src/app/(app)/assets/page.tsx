"use client";

import { Button } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Assets() {
	const router = useRouter();
	return (
		<div>
			<Button
				variant='contained'
				sx={{
					mb: 2,
				}}
				onClick={() => {
					router.push("/generate");
				}}
			>
				Generate
			</Button>
		</div>
	);
}
