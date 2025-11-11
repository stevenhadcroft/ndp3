export const Spinner = () => {
	return (
		<div style={{ zIndex: 999999, position: "absolute", width: "100%", textAlign: "center", top: "calc(50% - 40px)" }}>
			<img src="../imgs/spinner.svg" width="80px" height="80px" />
		</div>
	);
};
