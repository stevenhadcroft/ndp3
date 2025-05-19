
import { useState, useEffect, useCallback } from "react";
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
	setSelectedIndex, 
	setDragIndex,
	storeHistroy,
	setTemplateLock,

	addImage,
	addText,
	setTemplateData,
	fileLoadUpdate
} from "./actions";

import { loadImage, loadTemplate } from "./loaders";


let clickOffset = {};

const Canvas = () => {
	const view = useSelector(state => state.view);
	const canvas = useSelector(state => state.canvas);
	const dispatch = useDispatch();

	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
	const [panx, setPanx] = useState(0);
	const [pany, setPany] = useState(0);
	const [zoom, setZoom] = useState(1);

	const orientation	= canvas.orientation || "portrait";
	let canvasScale 	= view.canvasScale * (orientation === "portrait" ? 1 : 1.36);
	const canvasLeft 	= window.innerWidth/2 - canvasScale*750/2 - (orientation === "portrait" ? -25 : 50);
	const mode 			= view.mode;
	const dragIndex 	= view.dragIndex;
	const brushColour 	= view.brushColour;
	const selectedIndex = canvas.selectedIndex;
	const images 		= canvas.images || [];
	const textData 		= canvas.texts || [];
	const template 		= canvas.template;
	
	const canvasTop 	= view.fullScreen ? "15px" : null;
	
	useEffect(()=>{
		if (canvas.fileLoadUpdate && canvas.fileLoadUpdate.data){			
			if (canvas.fileLoadUpdate.data.imageData && canvas.fileLoadUpdate.data.imageData.length>0){
				let item = canvas.fileLoadUpdate.data.imageData.pop();
				const url = item.url;
				const filename = item.filename;
				const images = canvas.images || [];
				const zIndex = images.length>0 ? Math.max.apply(Math, images.map(function(o) { return o.zIndex; })) + 1 : 1; // get highest zindex + 1 
				const newImage = { ...item, type:"image", zIndex, url};
				dispatch(addImage(newImage));

				const callback1 = (index, key, svg) => {
					svg = svg.replace('<svg ', `<svg filename="${filename}" `);
					dispatch(updateImageData(index, key, svg));		
				}

				// update whole svg data - so when we clone the imgage the svg contained the colours 
				const callback2 = (index) => {
					const el = document.getElementById("image-"+index);
					if (el){
						const svgmarkup = el.innerHTML;
						dispatch(updateImageData(index, 'svg', svgmarkup));
					}
				}

				loadImage(url, images, callback1, newImage, callback2);
				
				// trigger next item
				dispatch(fileLoadUpdate({data:canvas.fileLoadUpdate.data}));
			
			} else if (canvas.fileLoadUpdate.data.textData && canvas.fileLoadUpdate.data.textData.length>0){
				let item = canvas.fileLoadUpdate.data.textData.pop();
				const texts = canvas.texts || [];
				const zIndex = texts.length>0 ? Math.max.apply(Math, texts.map(function(o) { return o.zIndex; })) + 1 : 1; // get highest zindex + 1 
				let newText = {...item, type: "text", zIndex};
				dispatch(addText(newText));	
				// trigger next item
				dispatch(fileLoadUpdate({data:canvas.fileLoadUpdate.data}));
			
			} else if (canvas.fileLoadUpdate.data.templateData){
				let item = canvas.fileLoadUpdate.data.templateData;
				// console.log('item ', item);
				const url = item.url;
				const newTemplate = { ...item, type:"image", url};
				dispatch(setTemplateData(newTemplate));
				loadTemplate(url, item || {}, 
					str => {
						dispatch(updateTemplateData("svg", str))
					}
				);
			}
		}
	}, [canvas.fileLoadUpdate])
	

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
		console.log('onImageClick')
		onDown(evt.clientX, evt.clientY, index, nextMode);
	}

	const onDown = (downX, downY, index, nextMode) => {
		console.log('onDown')
		if (mode !== Constants.MODE_COLOUR_IMAGE) {
			dispatch(setMode(nextMode));
			// dispatch(setSelectedIndex(index));
		}

		const el = document.elementsFromPoint(downX, downY);
		let elementSelectDone = false; // we only want to select one (topmost if stacked) element
		
		for (var i in el) {
			if (el[i] && el[i].nodeName === "use" && !elementSelectDone) {
				let fillId = el[i].getAttribute("xlink:href");
				fillId = fillId.substr(1, fillId.length - 1);
				const fill = document.getElementById(fillId); // node
				// console.log('fillId ', fillId)
				const fillIdStoreId = fillId.split("^")[1]; // string
				// console.log('fillIdStoreId ', fillIdStoreId)
				const path = fill.querySelector("path");
				
				// get (parent) index from clicked region 
				let s1 = fillId.split("^");
				index = Math.floor(s1[0].split('_')[1]);
				// console.log(index)

				const isTemplate = fillId.indexOf('template') !== -1;
				console.log('isTemplate ', isTemplate);
				// console.log('path ', path);

				// if (isTemplate){
				// 	dispatch(setSelectedIndex(null));
				// }

				// if colouring active then apply colour
				if (brushColour) {
					if (path) {
						// don't colour outline
						if (fillIdStoreId.substr(0, 7) === "outline") return;
						// is it a template? and locked?
						// if (isTemplate && !view.templateLock) return;
						// superficially colour dom
						path.setAttribute("fill", brushColour);
						// store colour	for saving	
						// if (nextMode === Constants.MODE_EDIT_IMAGE || nextMode === Constants.MODE_EDIT_TEMPLATE) {
						if (view.mode === Constants.MODE_COLOUR_IMAGE) {
							if (isTemplate){ // isNaN(index)
								dispatch(updateTemplateData(fillIdStoreId, brushColour));
	
							} else {
								dispatch(updateImageData(index, fillIdStoreId, brushColour));
								// update whole svg data - so when we clone the imgage the svg contained the colours 
								const el = document.getElementById("image-"+index);
								if (el){
									const svgmarkup = el.innerHTML;
									dispatch(updateImageData(index, 'svg', svgmarkup));
								}
							}
						} 
					}
				}

				
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

	const onUnlock = () => {
		dispatch(setTemplateLock(!view.templateLock));
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

	// ------------ STYLES ------------ 
	const calcImageStyle = (item, index) => {
		return  {
			position: "absolute",
			zIndex: item.zIndex,
			left: `${item.x - item.size / 2}px`,
			top: `${item.y - item.size / 2}px`,
			transform: `rotate(${item.angle}deg)`,
			border: selectedIndex === index && mode === Constants.MODE_EDIT_IMAGE && !brushColour ? "solid 3px #0099CC" : "solid 3px #0099CC00",
			width: `${item.size}px`,
			height: `${item.size}px`,
		}
	}
	const calcTextStyle = (item, index) => {
		return  {
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
		}
	}
	

	return (
		// TODO - move canvas out of Images

		<div 	styleName="page" 
				onTouchMove={onTouchMove} 
				onMouseMove={onMouseMove} 
				onMouseUp={onUp} 
				onTouchEnd={onUp}>	

	
			<div 	id="canvas" 
					styleName={`canvas ${orientation}`} 
					style={{ 	transform: `scale(${canvasScale})`, 
								left:`${canvasLeft}px`, 
								top: canvasTop, 
								clipPath:"none",
							}}>
				
				<div id="canvas-inner" style={{transform:`scale(${zoom}) translate(${panx}px, ${pany}px)`}}>
					{template &&
						<div id='template' 
							styleName='template'
							// NEEDS STYLE width/height for LANDSCAPE print
							style={orientation === "landscape" ? {
								width: `${800*0.9}px`,
								height: `${1120*0.9}px`,
								background:"#fff", 
								transform:  "translate(150px, -120px) rotate(90deg)"
							} : null}
							onMouseDown={evt => onImageClick(evt, 0, Constants.MODE_EDIT_TEMPLATE)}
							onTouchStart={evt => onImageTouch(evt, 0, Constants.MODE_EDIT_TEMPLATE)}
							dangerouslySetInnerHTML={{ __html: template.svg }}
						/>
					}

					<div style={{ clipPath: "xywh(0 0 768px 1024px)" }}>
						{images.map((item, index) => {
							const id = `image-${index}`;
							return (
								<div key={id} id={id}
									onMouseDown={evt => onImageClick(evt, index, Constants.MODE_EDIT_IMAGE)}
									onTouchStart={evt => onImageTouch(evt, index, Constants.MODE_EDIT_IMAGE)}
									style={{ ...calcImageStyle(item, index) }}
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
									style={calcTextStyle(item, index)}>
									{item.text}
								</div>
							);
						})}
					</div>

					{brushColour && mode === Constants.MODE_COLOUR_IMAGE &&
						<div style={{position:"absolute", left: `${mousePos.x}px`, top: `${mousePos.y-150/zoom}px`, pointerEvents:"none"}}>
							<BrushSVG id="brush-tip" width={150/zoom} height={150/zoom}/>
						</div>
					}

				</div>

				{/* ---- transform widget ---- */}
				<div style={{transform:`scale(${zoom}) translate(${panx}px, ${pany}px)`}}>
					<div>
						{(!brushColour && (textData[selectedIndex] || images[selectedIndex]) && (mode === Constants.MODE_EDIT_IMAGE || mode === Constants.MODE_EDIT_TEXT)) &&
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
			</div>

			{/* controls */}
			{!view.fullScreen &&
			<div styleName={view.mode === Constants.MODE_SAVE_PROJECT ? "saving" : null}>
				{/* <div onClick={onUnlock} style={{marginLeft:"-100px"}} styleName="canvas-icon template-lock"><img src={`./imgs/gui/icon-lock-${view.templateLock ? "open" : "closed"}.svg`} alt=""/></div> */}
				{/* <div onMouseDown={onUnlock} style={{marginLeft:"-100px"}} styleName="canvas-icon template-lock"><img src={`./imgs/gui/icon-lock-${view.templateLock ? "open" : "closed"}.svg`} alt=""/></div> */}
				<div onMouseDown={evt => onPan(eDirection.UP)} styleName="canvas-icon pan up"/>
				<div onMouseDown={evt => onPan(eDirection.DOWN)} styleName="canvas-icon pan down"/>
				<div onMouseDown={evt => onPan(eDirection.LEFT)} styleName="canvas-icon pan left"/>
				<div onMouseDown={evt => onPan(eDirection.RIGHT)} styleName="canvas-icon pan right"/>
				<div onMouseDown={evt => onPan(eDirection.IN)} styleName="canvas-icon zoom in">+</div>
				<div onMouseDown={evt => onPan(eDirection.OUT)} styleName="canvas-icon zoom out">-</div>
				<div onMouseDown={evt => onPan(eDirection.RESET)} styleName="canvas-icon reset"/>
			</div>
			}
			{/* 
			----------------------------------------------------
			BOXVIEW ONLY - so it appears outside of canvas area 
			---------------------------------------------------- 
			 */}

			<div styleName={`canvas-controls ${orientation}`} style={{ opacity:"0.2", pointerEvents: "none", transform: `scale(${canvasScale})`, left:`${canvasLeft}px`}}>			
				<div style={{transform:`scale(${zoom}) translate(${panx}px, ${pany}px)`}}>
					{images.map((item, index) => {
						const id = `image-viewonly-${index}`;
						const key = id;
						return (
							<div key={key} id={id} style={calcImageStyle(item, index)}/>
						);
					})}
					{textData.map((item, index) => {
						const id = `text-viewonly-${index}`;
						return (
							<div key={id} id={id} style={calcTextStyle(item, index)}/>
						);
					})}
				</div>
			</div>
		</div>
		
	);
}

export default CSSModules(Canvas, styles, {allowMultiple:true});
