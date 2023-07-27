"use client";
import { Button, Grid } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

const routesDefault = [
	{
		path: "/generate",
		name: "Generate",
	},
	{
		path: "/assets",
		name: "Assets",
	},

	{
		path: "/settings",
		name: "Settings",
	},
];

export default function AppLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	const [routes, setRoutes] = React.useState(routesDefault);
	const [activeRoute, setActiveRoute] = React.useState<any>(null);
	const pathname = usePathname();
	const router = useRouter();
	useEffect(() => {
		if (pathname && routes) {
			console.log(pathname);

			setActiveRoute(
				routes.find((route) => {
					return route.path === pathname;
				}) || routes[0]
			);
		}
	}, [pathname, routes]);

	const handleRoute = (route: string) => {
		router.push(route);
	};

	return (
		<Grid container spacing={3}>
			<Grid item xs={12}>
				<Grid container justifyContent='center' spacing={3}>
					{routes.map((route, index) => (
						<Grid key={index} item>
							<Button
								variant='contained'
								sx={{
									...(activeRoute &&
										activeRoute.path === route.path && {
											backgroundColor: "primary.main",
											color: "white",
										}),
								}}
								onClick={() => {
									handleRoute(route.path);
								}}
							>
								{route.name}
							</Button>
						</Grid>
					))}
				</Grid>
			</Grid>
			<Grid item xs={12}>
				{children}
			</Grid>
		</Grid>
	);
}
