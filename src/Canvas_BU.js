
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux'
import CSSModules from 'react-css-modules';
import styles from './styles/';
import TransformWidget from "./TransformWidget";
import { Constants } from "./constants";
import { eDirection } from "./constants";
import { BrushSVG } from "./SVG";
import { 
	setMode, 
	updateImageData, 
	updateTemplateData, 
	updateTextData, 
	duplicateImage, 
	duplicateText, 
	deleteImage, 
	setSelectedIndex, 
	setDragIndex,
	storeHistroy
} from "./actions";


let clickOffset = {};

const Canvas = () => {
	const view = useSelector(state => state.view);
	const canvas = useSelector(state => state.canvas);
	const dispatch = useDispatch();

	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
	const [panx, setPanx] = useState(0);
	const [pany, setPany] = useState(0);
	const [zoom, setZoom] = useState(1);

	const canvasScale 	= view.canvasScale;
	const mode 			= view.mode;
	const dragIndex 	= view.dragIndex;
	const brushColour 	= view.brushColour;
	const selectedIndex = canvas.selectedIndex;
	const images 		= canvas.images || [];
	const textData 		= canvas.texts || [];
	const template 		= canvas.template;

	const onKeyDown = evt => {
		if (evt.keyCode === 8 && selectedIndex && (mode === Constants.MODE_EDIT_IMAGE || mode === Constants.MODE_EDIT_TEXT)) {
			dispatch(deleteImage());
		}
	};

	useEffect(() => {
		document.addEventListener("keydown", onKeyDown);
	}, []);

	const updateData = (index, key, value) => {
		switch (mode) {
			case Constants.MODE_EDIT_IMAGE: dispatch(updateImageData(index, key, value)); break;
			case Constants.MODE_COLOUR_IMAGE: dispatch(updateImageData(index, key, value)); break;
			case Constants.MODE_EDIT_TEXT: dispatch(updateTextData(key, value)); break;
			default: break;
		}
	};

	const getHighestZdepth = () => {
		return Math.max.apply(
			Math,
			images.map(function(o) {
				return o.zIndex;
			})
		);
	};

	//---------------------
	// ON DOWN
	//---------------------

	const onImageTouch = (e, index, nextMode) => {
		var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
		var touch = evt.touches[0] || evt.changedTouches[0];
		onDown(touch.pageX, touch.pageY, index, nextMode);
	}

	const onImageClick = (evt, index, nextMode) => {
		onDown(evt.clientX, evt.clientY, index, nextMode);
	}

	const onDown = (downX, downY, index, nextMode) => {
		if (mode !== Constants.MODE_COLOUR_IMAGE) {
			dispatch(setMode(nextMode));
		}

		const el = document.elementsFromPoint(downX, downY);
		let elementSelectDone = false; // we only want to select one (topmost if stacked) element
		
		for (var i in el) {
			if (el[i] && el[i].nodeName === "use" && !elementSelectDone) {
				let fillId = el[i].getAttribute("xlink:href");
				fillId = fillId.substr(1, fillId.length - 1);
				const fill = document.getElementById(fillId); // node
				const fillIdStoreId = fillId.split("^")[1]; // string
				const path = fill.querySelector("path");
				
				// if colouring active then apply colour
				if (brushColour) {
					if (path) {
						// don't colour outline
						if (fillIdStoreId.substr(0, 7) === "outline") return;
					
						path.setAttribute("fill", brushColour);

						// store colour		
						if (nextMode === Constants.MODE_EDIT_IMAGE) {
							dispatch(updateImageData(index, fillIdStoreId, brushColour));
							// update whole svg data for use on proj load
							const svgmarkup = document.getElementById("image-"+index).innerHTML;
							dispatch(updateImageData(index, 'svg', svgmarkup));
							// console.log(svgmarkup);

						} else if (nextMode === Constants.MODE_EDIT_TEMPLATE) {
							dispatch(updateTemplateData(fillIdStoreId, brushColour));
							// update whole svg data for use on proj load
							const svgmarkup = document.getElementById("template").innerHTML;
							dispatch(updateTemplateData('svg', svgmarkup));
						}
					}
				}

				// get (parent) index from clicked region 
				let s1 = fillId.split("^");
				index = Math.floor(s1[0].split('_')[1]);
				// alert(index)
				// if NOT colouring then drag / activated transform widget
				if (!brushColour) {
					dispatch(setDragIndex(index));
					dispatch(setSelectedIndex(index));
					updateData(index, "zIndex", getHighestZdepth() + 1);

					//set offset to
					const canvasRect = document.getElementById("canvas").getBoundingClientRect();
					const imageEl = document.getElementById("image-" + index);
					if (imageEl) {
						const imageRect = imageEl.getBoundingClientRect();
						const x = downX - imageRect.left - imageRect.width / 2 + canvasRect.left;
						const y = downY - imageRect.top - imageRect.height / 2 + canvasRect.top;
						clickOffset = { x, y };
					}
				}

				elementSelectDone = true;
			}
		}
	};
	
	//---------------------
	// TEXT - ON DOWN
	//---------------------
	const onTextTouch = (e, index) => {
		var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
		var touch = evt.touches[0] || evt.changedTouches[0];
		onTextDown(touch.pageX, touch.pageY, index);
	}

	const onTextClick = (evt, index) => {
		onTextDown(evt.clientX, evt.clientY, index);
	}

	const onTextDown = (downX, downY, index) => {
		if (mode !== Constants.MODE_COLOUR_IMAGE) {
			dispatch(setMode(Constants.MODE_EDIT_TEXT));
		}
		dispatch(setDragIndex(index));
		dispatch(setSelectedIndex(index));
		updateData(index, "zIndex", getHighestZdepth() + 1);

		//set offset to
		const canvasRect = document.getElementById("canvas").getBoundingClientRect();
		const imageEl = document.getElementById("text-" + index);
		if (imageEl) {
			const imageRect = imageEl.getBoundingClientRect();
			const x = downX - imageRect.left - imageRect.width / 2 + canvasRect.left;
			const y = downY - imageRect.top - imageRect.height / 2 + canvasRect.top;
			clickOffset = { x, y };
		}
	};

	const onUp = e => { 
		dispatch(setDragIndex(-1));
		if (mode === Constants.MODE_COLOUR_IMAGE) {
			dispatch(storeHistroy());
		}
		if (mode === Constants.MODE_EDIT_IMAGE) {
			dispatch(storeHistroy());
		}
		// if (Constants.MODE_EDIT_IMAGE)
	};

	//---------------------
	// ON MOVE
	//---------------------
	const onTouchMove = e => {
		var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
		var touch = evt.touches[0] || evt.changedTouches[0];
		onMove(touch.pageX, touch.pageY);
	}

	const onMouseMove = evt => {
		onMove(evt.clientX, evt.clientY);
	}

	const onMove = (moveX, moveY) => {
		const canvasRect = document.getElementById("canvas").getBoundingClientRect();
		const canvasInnerRect = document.getElementById("canvas-inner").getBoundingClientRect();
		const x = (moveX - canvasRect.left + (canvasRect.left - canvasInnerRect.left)) / canvasScale / zoom;
		const y = (moveY - canvasRect.top + (canvasRect.top - canvasInnerRect.top)) / canvasScale / zoom;
		setMousePos({ x, y }); // diff coords for transform widget as we need to use clickoffset
		window.mousex = x;
		window.mousey = y;
		if (dragIndex !== -1) {
			updateData(dragIndex, "x", (moveX - clickOffset.x + (canvasRect.left - canvasInnerRect.left)) / canvasScale / zoom); 
			updateData(dragIndex, "y", (moveY - clickOffset.y + (canvasRect.top - canvasInnerRect.top)) / canvasScale / zoom ); 
		}
	};

	const setAngle = ang => {
		updateData(selectedIndex, "angle", ang);
	};

	const setSize = size => {
		updateData(selectedIndex, "size", size);
	};

	// const onDuplicate = () => {
	// 	if (mode === Constants.MODE_EDIT_IMAGE){
	// 		dispatch(duplicateImage());
	// 	} else {
	// 		dispatch(duplicateText());
	// 	}
	// };

	const onUnlock = () => {
		if (mode === Constants.MODE_EDIT_IMAGE){
			dispatch(duplicateImage());
		} else {
			dispatch(duplicateText());
		}
	};

	const onPan = dir => {
		const STEP = 30;
		switch(dir){
			case eDirection.UP : setPany(pany - STEP); break;
			case eDirection.DOWN : setPany(pany + STEP); break;
			case eDirection.LEFT : setPanx(panx - STEP); break;
			case eDirection.RIGHT : setPanx(panx + STEP); break;
			case eDirection.IN : setZoom(zoom + 0.05); break;
			case eDirection.OUT : setZoom(zoom - 0.05); break;
			case eDirection.RESET : setZoom(1); setPanx(0); setPany(0); break;
			default: break;
		}
	};

	return (
		// TODO - move canvas out of Images
		<div 	styleName="page" 
				onTouchMove={onTouchMove} 
				onMouseMove={onMouseMove} 
				onMouseUp={onUp} 
				onTouchEnd={onUp}
		>	
			<div id="canvas" styleName="canvas" style={{ transform: `scale(${canvasScale})`, left:`${window.innerWidth/2 - canvasScale*750/2}px`}}>
				<div id="canvas-inner" style={{transform:`scale(${zoom}) translate(${panx}px, ${pany}px)`}}>
					{/* <div className="canvas-print-fix"></div> */}
					{template &&
						<div id='template'
						styleName='template'
							onMouseDown={evt => onImageClick(evt, 0, Constants.MODE_EDIT_TEMPLATE)}
							onTouchStart={evt => onImageTouch(evt, 0, Constants.MODE_EDIT_TEMPLATE)}
							dangerouslySetInnerHTML={{ __html: template.svg }}
						/>
					}
					{/* XX{images.length} */}
					{images.map((item, index) => {
						const id = `image-${index}`;
						return (
							<div key={id} id={id}
								onMouseDown={evt => onImageClick(evt, index, Constants.MODE_EDIT_IMAGE)}
								onTouchStart={evt => onImageTouch(evt, index, Constants.MODE_EDIT_IMAGE)}
								style={{
									position: "absolute",
									zIndex: item.zIndex,
									left: `${item.x - item.size / 2}px`,
									top: `${item.y - item.size / 2}px`,
									transform: `rotate(${item.angle}deg)`,
									border: selectedIndex === index && mode === Constants.MODE_EDIT_IMAGE && !brushColour ? "solid 3px #0099CC" : "solid 3px #0099CC00",
									width: `${item.size}px`,
									height: `${item.size}px`,
								}}
								dangerouslySetInnerHTML={{ __html: item.svg }}
							/>
						);
					})}
					{textData.map((item, index) => {
						const id = `text-${index}`;
						return (
							<div key={id} id={id}
								onMouseDown={evt => onTextClick(evt, index)}
								onTouchStart={evt => onTextTouch(evt, index)}
								style={{
									position: "absolute",
									zIndex:`${item.zIndex}`,
									left: `${item.x - item.size / 2}px`,
									top: `${item.y - item.size / 3 / 2}px`,
									transform: `rotate(${item.angle}deg)`,
									border: selectedIndex === index && mode === Constants.MODE_EDIT_TEXT && !brushColour ? "solid 3px #0099CC" : "solid 3px #0099CC00",
									width: `${item.size}px`,
									height: `${item.size / 4}px`,
									
									fontFamily:item.fontFamily,
									fontSize:`${item.fontSize}px`,
									textAlign:`${item.justify}`,
									fontStyle:item.italic ? "italic" : "normal",
									fontWeight:item.bold ? "bold" : "normal",
									color:item.colour,
								}}>
								{item.text}
							</div>
						);
					})}
				</div>

				{/* ---- transform widget ---- */}
				{/* 
				<div style={{transform:`scale(${zoom}) translate(${panx}px, ${pany}px)`}}>
					<div>
						{(!brushColour && (mode === Constants.MODE_EDIT_IMAGE || mode === Constants.MODE_EDIT_TEXT)) &&
							<TransformWidget
								item={mode === Constants.MODE_EDIT_TEXT ? textData[selectedIndex] : images[selectedIndex]}
								mousePosX={mousePos.x}
								mousePosY={mousePos.y}
								setAngle={setAngle} // TODO doesn't need to come back to App.js
								setSize={setSize} // TODO doesn't need to come back to App.js
								type={mode === Constants.MODE_EDIT_TEXT ? "text" : null}
							/>
						}
					</div>
				</div>
				 */}


				{/* controls */}
				<div styleName={view.mode === Constants.MODE_SAVE_PROJECT ? "saving" : null}>
					{/* <div onMouseDown={onDuplicate} styleName="canvas-icon duplicate"><img src="./imgs/gui/icon-dupe.svg" alt=""/></div> */}
					<div onMouseDown={onUnlock} styleName="canvas-icon template-lock"><img src="./imgs/gui/icon-lock-closed.svg" alt=""/></div>
					{/* <div onMouseDown={onUndo} styleName="canvas-icon undo"><img src="./imgs/gui/icon-undo.svg" alt=""/></div> */}
					{/* <div onMouseDown={onRedo} styleName="canvas-icon redo"><img src="./imgs/gui/icon-redo.svg" alt=""/></div> */}
					<div onMouseDown={evt => onPan(eDirection.UP)} styleName="canvas-icon pan up"/>
					<div onMouseDown={evt => onPan(eDirection.DOWN)} styleName="canvas-icon pan down"/>
					<div onMouseDown={evt => onPan(eDirection.LEFT)} styleName="canvas-icon pan left"/>
					<div onMouseDown={evt => onPan(eDirection.RIGHT)} styleName="canvas-icon pan right"/>
					<div onMouseDown={evt => onPan(eDirection.IN)} styleName="canvas-icon zoom in">+</div>
					<div onMouseDown={evt => onPan(eDirection.OUT)} styleName="canvas-icon zoom out">-</div>
					<div onMouseDown={evt => onPan(eDirection.RESET)} styleName="canvas-icon reset"/>
				</div>

			</div>

			{/* ----------------------------------------------------
			VIEW ONLY - so it appears outside of canvas area 
			---------------------------------------------------- */}			
			<div styleName="canvas-controls" style={{ transform: `scale(${canvasScale})`, left:`${window.innerWidth/2 - canvasScale*750/2}px`, pointerEvents: "auto"}}>

				<div style={{transform:`scale(${zoom}) translate(${panx}px, ${pany}px)`}}>
					{brushColour && mode === Constants.MODE_COLOUR_IMAGE &&
						<div styleName="brush" style={{left: `${mousePos.x}px`, top: `${mousePos.y-150/zoom}px`,}}>
							<BrushSVG width={150/zoom} height={150/zoom}/>
						</div>
					}
				</div>

				<div style={{transform:`scale(${zoom}) translate(${panx}px, ${pany}px)`}}>
					<div>
						{(!brushColour && (mode === Constants.MODE_EDIT_IMAGE || mode === Constants.MODE_EDIT_TEXT)) &&
							<TransformWidget
								item={mode === Constants.MODE_EDIT_TEXT ? textData[selectedIndex] : images[selectedIndex]}
								mousePosX={mousePos.x}
								mousePosY={mousePos.y}
								setAngle={setAngle} // TODO doesn't need to come back to App.js
								setSize={setSize} // TODO doesn't need to come back to App.js
								type={mode === Constants.MODE_EDIT_TEXT ? "text" : null}
								style={{zIndex:99999}}
							/>
						}
					</div>
				</div>
			</div>




			{/* ----------------------------------------------------
			VIEW ONLY - so it appears outside of canvas area 
			---------------------------------------------------- */}
			
			<div styleName="canvas-controls" style={{ transform: `scale(${canvasScale})`, left:`${window.innerWidth/2 - canvasScale*750/2}px`, pointerEvents: "none"}}>
				<div style={{transform:`scale(${zoom}) translate(${panx}px, ${pany}px)`}}>
					{images.map((item, index) => {
						const id = `image-${index}`;
						return (
							<div key={id} id={id}
								// onMouseDown={evt => onImageClick(evt, index, Constants.MODE_EDIT_IMAGE)}
								// onTouchStart={evt => onImageTouch(evt, index, Constants.MODE_EDIT_IMAGE)}
								style={{
									position: "absolute",
									// opacity:0.5,
									zIndex: item.zIndex,
									left: `${item.x - item.size / 2}px`,
									top: `${item.y - item.size / 2}px`,
									transform: `rotate(${item.angle}deg)`,
									border: selectedIndex === index && mode === Constants.MODE_EDIT_IMAGE && !brushColour ? "solid 3px #0099CC" : "solid 3px #0099CC00",
									width: `${item.size}px`,
									height: `${item.size}px`,
								}}
								// dangerouslySetInnerHTML={{ __html: item.svg }}
							/>
						);
					})}
					{textData.map((item, index) => {
						const id = `text-${index}`;
						return (
							<div key={id} id={id}
								// onMouseDown={evt => onTextClick(evt, index)}
								// onTouchStart={evt => onTextTouch(evt, index)}
								style={{
									position: "absolute",
									zIndex:`${item.zIndex}`,
									left: `${item.x - item.size / 2}px`,
									top: `${item.y - item.size / 3 / 2}px`,
									transform: `rotate(${item.angle}deg)`,
									border: selectedIndex === index && mode === Constants.MODE_EDIT_TEXT && !brushColour ? "solid 3px #0099CC" : "solid 3px #0099CC00",
									width: `${item.size}px`,
									height: `${item.size / 4}px`,
									
									fontFamily:item.fontFamily,
									fontSize:`${item.fontSize}px`,
									textAlign:`${item.justify}`,
									fontStyle:item.italic ? "italic" : "normal",
									fontWeight:item.bold ? "bold" : "normal",
									color:item.colour,
								}}>
								{item.text}
							</div>
						);
					})}

					{brushColour && mode === Constants.MODE_COLOUR_IMAGE &&
						<div styleName="brush" style={{left: `${mousePos.x}px`, top: `${mousePos.y-150/zoom}px`,}}>
							<BrushSVG width={150/zoom} height={150/zoom}/>
						</div>
					}
				</div>

				
				<div style={{transform:`scale(${zoom}) translate(${panx}px, ${pany}px)`}}>
					<div>
						{(!brushColour && (mode === Constants.MODE_EDIT_IMAGE || mode === Constants.MODE_EDIT_TEXT)) &&
							<TransformWidget
								item={mode === Constants.MODE_EDIT_TEXT ? textData[selectedIndex] : images[selectedIndex]}
								mousePosX={mousePos.x}
								mousePosY={mousePos.y}
								setAngle={setAngle} // TODO doesn't need to come back to App.js
								setSize={setSize} // TODO doesn't need to come back to App.js
								type={mode === Constants.MODE_EDIT_TEXT ? "text" : null}
								style={{zIndex:99999}}
							/>
						}
					</div>
				</div>

			</div>
		</div>
	);
}

export default CSSModules(Canvas, styles, {allowMultiple:true});
