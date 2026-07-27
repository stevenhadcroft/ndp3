import { useState, useEffect, Fragment } from "react";

let startAngle = null;
let startScale = null;
let lastMousePosX = 0;
let lastMousePosY = 0;
const HANDLE_SIZE = 50;
const ICON_SIZE = 50;
const QR = Math.PI / 2;

function TransformWidget(props) {

	const [isRotating, setIsRotating] = useState(false);

	const item = props.item || {}; // {} isprevent errors which sometimes occur after deleting images

	const styleHander = {
		position: "absolute",
		backgroundColor: "var(--color-ui-transform-widget)",
		border: `solid 3px var(--color-ui-transform-widget)`,
		width: `${HANDLE_SIZE}px`,
		height: `${HANDLE_SIZE}px`,
		transform: `rotate(${item.angle}deg)`,
		zIndex: item.zIndex,
	};

	const C = item.size / 2 * 1.41;
	const X = item.x - HANDLE_SIZE / 2;
	const Y = item.y - HANDLE_SIZE / 2;
	let ang = QR / 2 + item.angle / (180 / Math.PI);
	const radiusIcon = props.type === 'text' ? C * 0.70 : C;

	const onEndRotating = () => {
		setIsRotating(false)
	}

	useEffect(() => {
		window.addEventListener("mouseup", onEndRotating);
		window.addEventListener("touchend", onEndRotating);
		return () => {
			document.removeEventListener("mouseup", onEndRotating);
			document.removeEventListener("touchend", onEndRotating);
		};
	}, []);

	useEffect(() => {
		if (lastMousePosX === props.mousePosX && lastMousePosY === props.mousePosY) {
			// do nothing, return may through 'destroy' isn't a function error??? dunno
		} else {
			const p1 = { x: item.x, y: item.y }; // - 150
			const p2 = { x: props.mousePosX, y: props.mousePosY };
	
			if (isRotating === "rotate") {
				const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
				if (startAngle === null) startAngle = angle - item.angle;
				props.setAngle(angle - startAngle);
	
			} else if (isRotating === "scale") {
				const a = p1.x - p2.x;
				const b = p1.y - p2.y;
				const c = Math.sqrt(a * a + b * b);
				const size = c * 1.41;
				if (startScale === null) startScale = size - item.size;
				props.setSize(size - startScale);
			}
	
			lastMousePosX = props.mousePosX;
			lastMousePosY = props.mousePosY;
		}
		
	}); // update everyframe // props.mousePos

	const onDown = e => {
		startAngle = null;
		startScale = null;
		setIsRotating(e.currentTarget.id);
	};

	let angA = props.type === 'text' ? ang - 0.6 : ang;
	let angB = props.type === 'text' ? ang + 0.6 : ang;

	return (
		<Fragment>
			<div 	onMouseDown={onDown} 
					onTouchStart={onDown} 
					id="scale" 
					style={{ ...styleHander, left: `${X + Math.cos(angA + QR * 0) * radiusIcon}px`, top: `${Y + Math.sin(angA + QR * 0) * radiusIcon}px` }}
			>
				<img
					src="./imgs/scale-white.png"
					alt=""
					style={{
						pointerEvents: "none",
						width: `${ICON_SIZE}px`,
						height: `${ICON_SIZE}px`,
					}}
				/>
			</div>
			<div 	onMouseDown={onDown} 
					onTouchStart={onDown} 
					id="rotate" 
					style={{ ...styleHander, left: `${X + Math.cos(angB + QR * 1) * radiusIcon}px`, top: `${Y + Math.sin(angB + QR * 1) * radiusIcon}px` }}
			>
				<img
					src="./imgs/rotate-white.png"
					alt=""
					style={{
						pointerEvents: "none",
						width: `${ICON_SIZE}px`,
						height: `${ICON_SIZE}px`,
					}}
				/>
			</div>
			{/* <div onMouseDown={onMouseDown} style={{ left: `${X + Math.cos(ang + QR * 2) * C}px`, top: `${Y + Math.sin(ang + QR * 2) * C}px` }} />
			<div onMouseDown={onMouseDown} style={{ left: `${X + Math.cos(ang + QR * 3) * C}px`, top: `${Y + Math.sin(ang + QR * 3) * C}px` }} /> */}
		</Fragment>
	);
}

export default TransformWidget;
