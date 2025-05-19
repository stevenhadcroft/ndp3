import React, { useEffect } from "react";
import CSSModules from 'react-css-modules';
import styles from './styles/';
import { Constants } from "./constants";

// https://www.w3schools.com/howto/howto_js_draggable.asp

function dragElement(elmnt) {

	let pos1 = 0,
		pos2 = 0,
		pos3 = 0,
		pos4 = 0;
		if (!elmnt) return false;


	function dragMouseDown(e) {
		// alert(1)
		e = e || window.event;
		e.preventDefault();
		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
	}

	const dragTouchStart = (e, index, nextMode) => {
		var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
		var touch = evt.touches[0] || evt.changedTouches[0];
		pos3 = touch.pageX;
		pos4 = touch.pageY;
		document.ontouchmove = elementMove;
		document.ontouchend = closeDragElement;
	}


	if (document.getElementById(elmnt.id + "-header")) {
		// if present, the header is where you move the DIV from:
		document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
		document.getElementById(elmnt.id + "-header").ontouchstart = dragTouchStart;
	} else {
		// otherwise, move the DIV from anywhere inside the DIV:
		elmnt.onmousedown = dragMouseDown;
		elmnt.ontouchstart = dragTouchStart;
	}

	

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		// set the element's new position:
		elmnt.style.top = elmnt.offsetTop - pos2 + "px";
		elmnt.style.left = elmnt.offsetLeft - pos1 + "px";

		//store locally
		localStorage.setItem(Constants.LOCAL_DATA_CONFIG + "dragPanelPosX" + elmnt.id, elmnt.offsetLeft - pos1);
		localStorage.setItem(Constants.LOCAL_DATA_CONFIG + "dragPanelPosY" + elmnt.id, elmnt.offsetTop - pos2);
	}

	

	function elementMove(e) { /// DO
		var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
		var touch = evt.touches[0] || evt.changedTouches[0];
		// calculate the new cursor position:
		pos1 = pos3 - touch.pageX;
		pos2 = pos4 - touch.pageY;
		pos3 = touch.pageX;
		pos4 = touch.pageY;
		// set the element's new position:
		elmnt.style.top = elmnt.offsetTop - pos2 + "px";
		elmnt.style.left = elmnt.offsetLeft - pos1 + "px";

		//store locally
		localStorage.setItem(Constants.LOCAL_DATA_CONFIG + "dragPanelPosX" + elmnt.id, elmnt.offsetLeft - pos1);
		localStorage.setItem(Constants.LOCAL_DATA_CONFIG + "dragPanelPosY" + elmnt.id, elmnt.offsetTop - pos2);
	}


	function closeDragElement() {
		// stop moving when mouse button is released:
		document.onmouseup = null;
		document.ontouchend = null;
		document.onmousemove = null;
		document.ontouchmove = null;
	}
}

// function DraggablePanel(props) {
function DraggablePanel({id, title, colour, type, children, buttons, central}) {
	const x = (window.innerWidth) / 2 - 150;
	const y = 50; //(window.innerHeight) / 2;
	const winx = localStorage.getItem(Constants.LOCAL_DATA_CONFIG + "dragPanelPosX" + id) || x;
	const winy = localStorage.getItem(Constants.LOCAL_DATA_CONFIG + "dragPanelPosY" + id) || y;

	useEffect(() => {
		dragElement(document.getElementById(id))
	}, []);

	return (
		<div id={id} 
			styleName={`panel ${type || ""}`} 
			style={
				central
					? { left: "50%", top:"50%", transform: "translate(-50%, calc(-50% - 30px))", backgroundColor:colour || null}
					: { left: `${winx}px`, top: `${winy}px`, backgroundColor:colour || null}
			}
		>

			<div id={`${id}-header`} styleName="dialogue-header">
				<span styleName="title" style={{flex:"1"}}>{title}</span>
					{buttons}
			</div>
			{children}
		</div>
	);
}

export default CSSModules(DraggablePanel, styles, {allowMultiple:true});
