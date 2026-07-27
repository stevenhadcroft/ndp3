import React, { useEffect, useRef, useState } from "react";
import { cx } from '../styles';
import { Constants } from "../constants";

const DRAG_PERSIST_KEY = (id) => `${Constants.LOCAL_DATA_CONFIG}dragPanel:${id}`;

function readSavedPos(id) {
	try {
		const raw = localStorage.getItem(DRAG_PERSIST_KEY(id));
		if (raw) {
			const { x, y } = JSON.parse(raw);
			if (typeof x === "number" && typeof y === "number") return { x, y };
		}
		const legacyX = localStorage.getItem(`${Constants.LOCAL_DATA_CONFIG}dragPanelPosX${id}`);
		const legacyY = localStorage.getItem(`${Constants.LOCAL_DATA_CONFIG}dragPanelPosY${id}`);
		if (legacyX != null && legacyY != null) {
			return { x: parseFloat(legacyX), y: parseFloat(legacyY) };
		}
	} catch { /* corrupt JSON or storage disabled — fall through */ }
	return null;
}

// Allow panels to move outside the viewport, but keep a strip of the header
// reachable so the user can always drag them back.
const MIN_VISIBLE = 40;

function clampToViewport(x, y, width, height) {
	const minX = MIN_VISIBLE - width;
	const maxX = window.innerWidth - MIN_VISIBLE;
	const minY = 0;
	const maxY = window.innerHeight - MIN_VISIBLE;
	return {
		x: Math.min(Math.max(x, minX), maxX),
		y: Math.min(Math.max(y, minY), maxY),
	};
}

function DraggablePanel({ id, title, type, children, buttons, central, hideHeader }) {
	const panelRef = useRef(null);
	const headerRef = useRef(null);

	const [pos, setPos] = useState(() => {
		const saved = readSavedPos(id);
		if (saved) return saved;
		return { x: window.innerWidth / 2 - 150, y: 50 };
	});

	useEffect(() => {
		if (central) return undefined;
		const panel = panelRef.current;
		const handle = headerRef.current || panel;
		if (!panel || !handle) return undefined;

		let dragging = false;
		let startX = 0;
		let startY = 0;
		let originX = 0;
		let originY = 0;
		let lastPos = pos;

		const onPointerDown = (e) => {
			if (e.button !== undefined && e.button !== 0) return;
			if (e.target.closest("button, input, select, textarea, a")) return;
			dragging = true;
			startX = e.clientX;
			startY = e.clientY;
			originX = panel.offsetLeft;
			originY = panel.offsetTop;
			handle.setPointerCapture?.(e.pointerId);
			e.preventDefault();
		};

		const onPointerMove = (e) => {
			if (!dragging) return;
			const next = clampToViewport(
				originX + (e.clientX - startX),
				originY + (e.clientY - startY),
				panel.offsetWidth,
				panel.offsetHeight,
			);
			panel.style.left = `${next.x}px`;
			panel.style.top = `${next.y}px`;
			lastPos = next;
		};

		const onPointerUp = (e) => {
			if (!dragging) return;
			dragging = false;
			handle.releasePointerCapture?.(e.pointerId);
			try {
				localStorage.setItem(DRAG_PERSIST_KEY(id), JSON.stringify(lastPos));
			} catch { /* quota or disabled storage — ignore */ }
			setPos(lastPos);
		};

		handle.addEventListener("pointerdown", onPointerDown);
		window.addEventListener("pointermove", onPointerMove);
		window.addEventListener("pointerup", onPointerUp);
		window.addEventListener("pointercancel", onPointerUp);

		return () => {
			handle.removeEventListener("pointerdown", onPointerDown);
			window.removeEventListener("pointermove", onPointerMove);
			window.removeEventListener("pointerup", onPointerUp);
			window.removeEventListener("pointercancel", onPointerUp);
		};
	}, [id, central]);

	useEffect(() => {
		if (central) return undefined;
		const onResize = () => {
			const panel = panelRef.current;
			if (!panel) return;
			setPos((prev) => {
				const next = clampToViewport(prev.x, prev.y, panel.offsetWidth, panel.offsetHeight);
				return next.x === prev.x && next.y === prev.y ? prev : next;
			});
		};
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [central]);

	const positionStyle = central
		? { left: "50%", top: "50%", transform: "translate(-50%, calc(-50% - 30px))" }
		: { left: `${pos.x}px`, top: `${pos.y}px` };
// 064679
	return (
		<div
			id={id}
			ref={panelRef}
			className={cx(`panel ${type || ""}`)}
			style={{ ...positionStyle }}
		>
			{!hideHeader &&
				<div id={`${id}-header`} ref={headerRef} className={cx("dialogue-header")}>
					<span className={cx("title")} style={{ flex: "1" }}>{title}</span>
					{buttons}
				</div>
			}
			{children}
		</div>
	);
}

export default DraggablePanel;
