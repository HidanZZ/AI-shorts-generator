"use client";
import React, { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	Table,
	TableBody,
	TableCell,
	TableRow,
	IconButton,
	Box,
	Button,
	Grid,
	InputLabel,
	TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-hot-toast";
import AddIcon from "@mui/icons-material/Add";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "@/lib/axios";

type Asset = {
	id: number;
	name: string;
	url: string;
};

type AssetForm = Omit<Asset, "id">;

export default function Assets() {
	const [assets, setAssets] = useState<Asset[]>([]);
	const [expanded, setExpanded] = useState(false);

	const handleAddClick = () => {
		setExpanded(true);
	};

	const handleCancelClick = () => {
		setExpanded(false);
	};
	const schema = yup.object().shape({
		name: yup.string().required(),
		url: yup.string().required(),
	});
	const defaultValues: AssetForm = {
		name: "",
		url: "",
	};

	const {
		control,
		handleSubmit,
		watch,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues,
		mode: "onSubmit",
		resolver: yupResolver(schema),
	});
	const fetchAssets = async () => {
		try {
			const response = await api.get("/settings/assets"); // replace with your API endpoint
			setAssets(response.data.assets);
		} catch (err: any) {
			console.log(err);

			toast.error(err.response.data.message ?? "Failed to fetch assets");
		}
	};
	useEffect(() => {
		fetchAssets();
	}, []);

	const handleDelete = async (id: number) => {
		api
			.delete(`/settings/assets/${id}`)
			.then((res) => {
				toast.success("Deleted Asset");
				fetchAssets();
			})
			.catch((err) => {
				toast.error(
					err.response.data.message ??
						"Failed to delete asset, Please try again later"
				);
			});
	};

	const handleSave = async (data: AssetForm) => {
		api
			.post("/settings/assets", data)
			.then((res) => {
				toast.success("Saved Asset");
				fetchAssets();
				handleCancelClick();
				reset();
			})
			.catch((err) => {
				toast.error(
					err.response.data.message ??
						"Failed to save asset, Please try again later"
				);
			});
	};
	return (
		<Card>
			<CardContent>
				<Box
					sx={{
						display: "flex",
						justifyContent: "flex-end",
						mb: 2,
					}}
				>
					<Button variant='contained' color='primary' onClick={handleAddClick}>
						<AddIcon />
					</Button>
				</Box>
				{expanded && (
					<Card
						sx={{
							mb: 2,
						}}
					>
						<CardContent>
							<Grid container spacing={3}>
								<Grid item xs={12}>
									<InputLabel
										sx={{
											color: "primary.main",
											mx: 2,
											mb: 1,
										}}
										htmlFor='name'
									>
										Name
									</InputLabel>
									<Controller
										name='name'
										control={control}
										render={({ field }) => (
											<TextField
												sx={{
													mx: 2,
												}}
												fullWidth
												id='name'
												type='text'
												error={Boolean(errors.name)}
												helperText={errors.name?.message}
												{...field}
											/>
										)}
									/>
								</Grid>
								<Grid item xs={12}>
									<InputLabel
										sx={{
											color: "primary.main",
											mx: 2,
											mb: 1,
										}}
										htmlFor='url'
									>
										URL
									</InputLabel>
									<Controller
										name='url'
										control={control}
										render={({ field }) => (
											<TextField
												sx={{
													mx: 2,
												}}
												fullWidth
												id='url'
												type='text'
												error={Boolean(errors.url)}
												helperText={errors.url?.message}
												{...field}
											/>
										)}
									/>
								</Grid>
								<Grid item xs={12}>
									<Button
										sx={{
											mx: 2,
										}}
										variant='contained'
										color='primary'
										onClick={handleSubmit((data) => {
											handleSave(data);
										})}
									>
										Save
									</Button>
									<Button
										sx={{
											mx: 2,
										}}
										variant='contained'
										color='primary'
										onClick={handleCancelClick}
									>
										Cancel
									</Button>
								</Grid>
							</Grid>
						</CardContent>
					</Card>
				)}
				<Table>
					<TableBody>
						{assets.length === 0 && (
							<TableRow>
								<TableCell align='center' colSpan={3}>
									No assets found
								</TableCell>
							</TableRow>
						)}
						{assets.map((asset) => (
							<TableRow key={asset.id}>
								<TableCell>{asset.name}</TableCell>
								<TableCell>{asset.url}</TableCell>
								<TableCell align='center'>
									<IconButton onClick={() => handleDelete(asset.id)}>
										<DeleteIcon />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
