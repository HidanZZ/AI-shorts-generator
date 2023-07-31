// 🖥️ Frontend Engineer
import { useEffect, useState } from "react";
import { Button, Card, Typography } from "@mui/material";
import LinearProgressWithLabel from "./LinearProgressWithLabel";

function JobStatus({
	jobId,
	setCompleted,
}: {
	jobId: string;
	setCompleted: any;
}) {
	const [jobStatus, setJobStatus] = useState({
		status: "Unknown",
		progress: 0,
	});
	const [videoUrl, setVideoUrl] = useState("");

	useEffect(() => {
		if (!jobId || jobId === "") return;

		const eventSource = new EventSource(
			`${process.env.NEXT_PUBLIC_API_URL}/job-status/${jobId}`
		);

		eventSource.onmessage = (event) => {
			console.log("Received event: ", event);
		};

		eventSource.addEventListener("jobStatus", (event) => {
			const data = JSON.parse(event.data);
			console.log("Received jobStatus event: ", data);

			setJobStatus(data);
			if (data.isFinished) {
				eventSource.close();
				setCompleted(true);
				setVideoUrl(data.videoUrl);
			}
		});

		eventSource.onerror = (event) => {
			console.error("EventSource failed: ", event);
			eventSource.close();
		};

		// Clean up the EventSource connection when the component unmounts
		return () => {
			eventSource.close();
		};
	}, [jobId]);

	return (
		<Card>
			<Typography variant='h6'>Job Status</Typography>
			<Typography variant='body1'>Status: {jobStatus.status}</Typography>
			<LinearProgressWithLabel value={jobStatus.progress} />

			{
				//download button
				videoUrl !== "" && (
					<Button
						variant='contained'
						color='primary'
						onClick={() => {
							window.open(videoUrl);
						}}
					>
						Download
					</Button>
				)
			}
		</Card>
	);
}

export default JobStatus;
