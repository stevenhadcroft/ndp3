import { useState, useEffect, Fragment, useRef, useMemo } from "react";

const HANDLE_SIZE = 50;
const ICON_SIZE = 50;
const QR = Math.PI / 2;

function TransformWidget({ item = {}, mousePosX, mousePosY, setAngle, setSize, type }) {
  const [isRotating, setIsRotating] = useState(false);
  const startAngle = useRef(null);
  const startScale = useRef(null);
  const lastMousePosX = useRef(0);
  const lastMousePosY = useRef(0);

  const styleHander = useMemo(() => ({
    position: "absolute",
    backgroundColor: "#0099CC",
    border: "solid 3px #0099CC",
    width: `${HANDLE_SIZE}px`,
    height: `${HANDLE_SIZE}px`,
    transform: `rotate(${item.angle}deg)`,
    zIndex: item.zIndex,
  }), [item.angle, item.zIndex]);

  const C = item.size / 2 * 1.41;
  const X = item.x - HANDLE_SIZE / 2;
  const Y = item.y - HANDLE_SIZE / 2;
  const ang = QR / 2 + item.angle / (180 / Math.PI);
  const radiusIcon = type === 'text' ? C * 0.70 : C;

  const onEndRotating = () => setIsRotating(false);

  useEffect(() => {
    window.addEventListener("mouseup", onEndRotating);
    window.addEventListener("touchend", onEndRotating);
    return () => {
      window.removeEventListener("mouseup", onEndRotating);
      window.removeEventListener("touchend", onEndRotating);
    };
  }, []);

  useEffect(() => {
    if (lastMousePosX.current === mousePosX && lastMousePosY.current === mousePosY) return;

    const p1 = { x: item.x, y: item.y };
    const p2 = { x: mousePosX, y: mousePosY };

    if (isRotating === "rotate") {
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
      if (startAngle.current === null) startAngle.current = angle - item.angle;
      setAngle(angle - startAngle.current);
    } else if (isRotating === "scale") {
      const a = p1.x - p2.x;
      const b = p1.y - p2.y;
      const c = Math.sqrt(a * a + b * b);
      const size = c * 1.41;
      if (startScale.current === null) startScale.current = size - item.size;
      setSize(size - startScale.current);
    }

    lastMousePosX.current = mousePosX;
    lastMousePosY.current = mousePosY;
  }, [isRotating, mousePosX, mousePosY, item.x, item.y, item.angle, item.size, setAngle, setSize]);

  const onDown = (e) => {
    startAngle.current = null;
    startScale.current = null;
    setIsRotating(e.currentTarget.id);
  };

  const angA = type === 'text' ? ang - 0.6 : ang;
  const angB = type === 'text' ? ang + 0.6 : ang;

  return (
    <Fragment>
      <div
        onMouseDown={onDown}
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
      <div
        onMouseDown={onDown}
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
    </Fragment>
  );
}

export default TransformWidget;

// Key Changes:
// Replaced let with useRef for mutable variables that need to persist across renders without causing re-renders.
// Destructured props for cleaner code.
// Optimized styles with useMemo to avoid recalculating styles on each render.
// Improved event listener cleanup to properly remove the listeners by using window instead of document to match the add event listeners.