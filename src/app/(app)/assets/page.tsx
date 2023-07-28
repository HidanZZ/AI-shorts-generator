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
	Drawer,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { toast } from "react-hot-toast";
import AddIcon from "@mui/icons-material/Add";
type Asset = {
	id: number;
	name: string;
	url: string;
};

export default function Assets() {
	const [assets, setAssets] = useState<Asset[]>([]);

	useEffect(() => {
		const fetchAssets = async () => {
			try {
				const response = await axios.get("/api/config/assets"); // replace with your API endpoint
				setAssets(response.data.assets);
			} catch (err: any) {
				console.log(err);

				toast.error(err.response.data.message ?? "Failed to fetch assets");
			}
		};

		fetchAssets();
	}, []);

	const handleDelete = async (id: number) => {
		try {
			await axios.delete(`/api/assets/${id}`); // replace with your API endpoint
			setAssets(assets.filter((asset: Asset) => asset.id !== id));
		} catch (err) {
			console.error(err);
		}
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
					<Button variant='contained' color='primary'>
						<AddIcon />
					</Button>
				</Box>
				<Table>
					<TableBody>
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
