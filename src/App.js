import { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import useNudgeKeyboardHandler from "./hooks/useNudgeKeyboardHandler";
import useDefaultTemplate from "./hooks/useDefaultTemplate"; 

import {
	setMode,
	setCanvasScale,
} from "./features/viewSlice";

import { eMode } from "./constants";

import Canvas from "./components/Canvas";
import ToolBar from "./components/ToolBar";
import Header from "./components/Header";
import DialoguePanelManager from "./dialoguePanels/PanelManager";
import { loadImageDirectoryData } from "./loaders";
import { checkLocalLicense } from './services/localLicenseMananger';

import {Spinner} from "./components/UIkit/Spinner";

const App = () => {

	const dispatch = useDispatch();
	const view = useSelector(state => state.view);
	const canvas = useSelector(state => state.canvas);
	const loadDefaultTemplate = useDefaultTemplate();

	useNudgeKeyboardHandler();

	useEffect(() => {
		async function fetchData() {
			await loadImageDirectoryData();
			resizeCanvas();
			loadDefaultTemplate();
			const licence = await checkLocalLicense();
			// console.log('licence ', licence)
			if (!licence) {
				dispatch(setMode(eMode.USER_OPTIONS));
			}
			window.addEventListener("resize", resizeCanvas);
		}
		fetchData();

	}, []);


	useEffect(() => {
		if (canvas.template === null) {
			// TODO - add to post project loading
			loadDefaultTemplate();
		}
	}, [canvas]);

	const resizeCanvas = () => {
		let scale = ((window.innerHeight - 60) / 1024); // - 0.03 - 0.04;
		dispatch(setCanvasScale(scale));
	};

	return (
		<div className="app">
			<Canvas />
			<div style={{ pointerEvents: view.dragIndex >= 0 ? "none" : "initial" }}>
				<ToolBar />
				<Header />
				<DialoguePanelManager />
			</div>
			{view.showLoader && <Spinner />}
		</div>
	);
}





export default App;
