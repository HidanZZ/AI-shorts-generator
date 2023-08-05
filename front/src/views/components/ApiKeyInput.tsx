"use client";
import { useDispatch, useSelector } from "@/store";
import { ApiKeys } from "@/types";
import {
	Box,
	Card,
	CardContent,
	Button,
	IconButton,
	InputLabel,
	TextField,
	Skeleton,
} from "@mui/material";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { addKey } from "@/store/apikeys";
import { toast } from "react-hot-toast";
type ApiKeyForm = {
	[key in ApiKeys]?: string;
};

const ApiKeyInput = ({ label, apiKey }: { label: string; apiKey: ApiKeys }) => {
	const [showApiKey, setShowApiKey] = useState(false);
	const { loading, keys } = useSelector((state) => state.apikeys);
	const dispatch = useDispatch();
	const schema = yup.object().shape({
		[apiKey]: yup.string().required(),
	});
	const defaultValues: ApiKeyForm = {
		[apiKey]: "",
	};

	const {
		control,
		handleSubmit,
		watch,
		reset,
		setValue,
		formState: { errors },
	} = useForm({
		defaultValues,
		mode: "onSubmit",
		resolver: yupResolver(schema),
	});
	useEffect(() => {
		if (keys) {
			setValue(apiKey, keys[apiKey]);
		}
	}, [keys, reset]);
	const onSubmit = (data: ApiKeyForm) => {
		dispatch(
			addKey({
				key: apiKey,
				value: data[apiKey],
			})
		)
			.unwrap()
			.then(() => {
				toast.success("Key saved");
			});
	};

	return (
		<Box
			component={"form"}
			sx={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
			}}
			onSubmit={handleSubmit(onSubmit)}
		>
			<InputLabel
				sx={{
					color: "primary.main",
					mx: 2,
				}}
				htmlFor='my-input'
			>
				{label}
			</InputLabel>
			{loading ? (
				<Skeleton
					variant='rectangular'
					height={56}
					sx={{
						flexGrow: 1,
					}}
				/>
			) : (
				<>
					<Controller
						name={apiKey}
						control={control}
						render={({ field }) => (
							<TextField
								sx={{
									mx: 2,
									flexGrow: 1,
								}}
								id='my-input'
								type={showApiKey ? "text" : "password"}
								aria-describedby='my-helper-text'
								{...field}
							/>
						)}
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
							type='submit'
						>
							Save
						</Button>
					</Box>
				</>
			)}
		</Box>
	);
};

export default ApiKeyInput;
