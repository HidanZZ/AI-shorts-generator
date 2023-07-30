import * as React from "react";
import { TextField, TextFieldProps } from "@mui/material";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

type CharCountTextfieldProps = TextFieldProps & {
	charLimit?: number;
};

const CharCountTextfield = ({
	charLimit = Infinity,
	value,
	onChange,
	...props
}: CharCountTextfieldProps) => {
	const charCount = typeof value == "string" ? value.length : 0;
	const limitExceeded = charCount >= charLimit;

	const handleInputChange = (event: any) => {
		if (event.target.value.length <= charLimit) {
			if (onChange) onChange(event);
		}
	};

	return (
		<Stack spacing={2}>
			<TextField
				{...props}
				value={value}
				onChange={handleInputChange}
				sx={{ mx: 2 }}
			/>
			{charLimit !== Infinity && (
				<Box
					sx={{
						alignSelf: "flex-end",
						color: limitExceeded ? "red" : "inherit",
					}}
				>
					{`${charCount}/${charLimit}`}
				</Box>
			)}
		</Stack>
	);
};

export default CharCountTextfield;
