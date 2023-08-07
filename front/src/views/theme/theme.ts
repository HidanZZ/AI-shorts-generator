import { createTheme } from "@mui/material/styles";

const theme = createTheme({
	palette: {
		primary: {
			main: "#000000", // Black
		},
		secondary: {
			main: "#ffffff", // White
		},
		text: {
			primary: "#000000", // Black
			secondary: "#ffffff", // White
		},
	},
	shape: {
		borderRadius: 0, // Rectangular shape for all components
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				".fade-in": {
					animation: "fadeIn ease 1s",
				},

				"@keyframes fadeIn": {
					"0%": { opacity: 0 },
					"100%": { opacity: 1 },
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					border: "1px solid #000000", // Black border
					boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)", // Shadow
					color: "#000000", // Black text
					backgroundColor: "#ffffff", // White background
					"&:hover": {
						backgroundColor: "#000000", // Black background on hover
						color: "#ffffff", // White text on hover
					},
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					border: "1px solid #000000", // Black border
					boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)", // Slight shadow
					padding: "10px 20px",
					margin: "10px",
					backgroundColor: "#ffffff", // White background
					color: "#000000", // Black text
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					border: "1px solid #000000", // Black border
					boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)", // Slight shadow
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					// border: "1px solid #000000", // Black border
					boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)", // Slight shadow
				},
			},
		},
		MuiRadio: {
			styleOverrides: {
				root: {
					color: "#000000", // Black text
				},
			},
		},
		MuiCheckbox: {
			styleOverrides: {
				root: {
					color: "#000000", // Black text
				},
			},
		},
		MuiTableCell: {
			styleOverrides: {
				root: {
					border: "1px solid #000000", // Black border
				},
			},
		},
		MuiTab: {
			styleOverrides: {
				root: {
					border: "1px solid #000000", // Black border
					boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)", // Slight shadow
					color: "#000000", // Black text
					backgroundColor: "#ffffff", // White background
					"&:hover": {
						backgroundColor: "#000000", // Black background on hover
						color: "#ffffff", // White text on hover
					},
					"&.Mui-selected": {
						backgroundColor: "#000000", // Black background on hover
						color: "#ffffff", // White text on hover
					},
				},
			},
		},
	},
});

export default theme;
