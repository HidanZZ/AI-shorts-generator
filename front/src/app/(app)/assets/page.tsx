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
	Skeleton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-hot-toast";
import AddIcon from "@mui/icons-material/Add";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "@/lib/axios";
import { useDispatch, useSelector } from "@/store";
import { addAsset, deleteAsset, getAssets } from "@/store/assets";
import { Asset } from "@/types";

type AssetForm = Omit<Asset, "_id">;

export default function Assets() {
	const { loading, error, assets } = useSelector((state) => state.assets);
	const dispatch = useDispatch();
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

	useEffect(() => {
		dispatch(getAssets());
	}, []);

	const handleDelete = async (id: string) => {
		dispatch(deleteAsset(id))
			.unwrap()
			.then(() => {
				toast.success("Asset deleted successfully");
			});
	};

	const handleSave = async (data: AssetForm) => {
		const { name, url } = data;
		dispatch(addAsset({ name, url }))
			.unwrap()
			.then(() => {
				toast.success("Asset added successfully");
				reset(defaultValues);
				setExpanded(false);
			});
	};
	useEffect(() => {
		if (error) {
			toast.error(error ?? "An error occurred");
		}
	}, [error]);
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
						{loading && (
							<TableRow>
								<TableCell align='center' colSpan={3}>
									<Skeleton variant='rectangular' width='100%' />
								</TableCell>
							</TableRow>
						)}
						{!assets ||
							(assets.length === 0 && (
								<TableRow>
									<TableCell align='center' colSpan={3}>
										No assets found
									</TableCell>
								</TableRow>
							))}
						{assets &&
							assets.map((asset) => (
								<TableRow key={asset._id}>
									<TableCell>{asset.name}</TableCell>
									<TableCell>{asset.url}</TableCell>
									<TableCell align='center'>
										<IconButton onClick={() => handleDelete(asset._id)}>
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
