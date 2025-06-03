import { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import useNudgeKeyboardHandler from "./hooks/useNudgeKeyboardHandler";
import useDefaultTemplate from "./hooks/useDefaultTemplate"; 
import useCanvasResize from "./hooks/useResizeCanvas";
import { setMode } from "./features/viewSlice";
import { eMode } from "./constants";
import { checkLocalLicense } from './services/localLicenseMananger';
import Canvas from "./components/Canvas";
import ToolBar from "./components/ToolBar";
import Header from "./components/Header";
import { Spinner } from "./components/UIkit/Spinner";
import DialoguePanelManager from "./dialoguePanels/PanelManager";
import { loadImageDirectoryData } from "./loaders";

const App = () => {

	const dispatch = useDispatch();
	const view = useSelector(state => state.view);
	const loadDefaultTemplate = useDefaultTemplate();
	useNudgeKeyboardHandler();
	useCanvasResize();
	
	useEffect(() => {
		async function fetchData() {
			await loadImageDirectoryData();
			const licence = await checkLocalLicense();
			if (!licence) {
				dispatch(setMode(eMode.USER_OPTIONS));
			}
			loadDefaultTemplate()
		}
		fetchData();
	}, []);

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
