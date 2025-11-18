import { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import useNudgeKeyboardHandler from "./hooks/useNudgeKeyboardHandler";
import useDefaultTemplate from "./hooks/useDefaultTemplate"; 
import useCanvasResize from "./hooks/useResizeCanvas";
import { setMode, setAppUpdateStatus, setGeneric } from "./features/viewSlice";
import { eMode } from "./constants";
import { checkLocalLicense } from './services/localLicenseMananger';
import Canvas from "./components/Canvas";
import ToolBar from "./components/ToolBar";
import Header from "./components/Header";
import { Spinner } from "./components/UIkit/Spinner";
import DialoguePanelManager from "./dialoguePanels/PanelManager";
import { loadImageDirectoryData } from "./loaders";
// import MenuGuide from './guide/MenuGuide';

const App = () => {

	const dispatch = useDispatch();
	const view = useSelector(state => state.view);
	const loadDefaultTemplate = useDefaultTemplate();
	useNudgeKeyboardHandler();
	useCanvasResize();
	
	// Progress bar handling
	useEffect(() => {
		// dispatch(setMode(eMode.APP_UPDATING));
		// dispatch(setAppUpdateStatus({percent:50}))
		if (window && window.electronAPI) {
			window.electronAPI.onUpdateProgress((event, progress) => {
				dispatch(setMode(eMode.APP_UPDATING));
				dispatch(setAppUpdateStatus({ percent: progress.percent }));
				// `Downloading: ${Math.round(progress.percent)}%
				// (${formatBytes(progress.transferred)} / ${formatBytes(progress.total)})
				// Speed: ${formatBytes(progress.bytesPerSecond)}/s`;
			});
		}
	}, []);

	useEffect(() => {
		async function fetchData() {
			await loadImageDirectoryData();
			const licence = await checkLocalLicense();
			dispatch(setGeneric({key:"userIsAuth", value:licence}))
			if (!licence) {
				dispatch(setMode(eMode.USER_OPTIONS));
			}
			loadDefaultTemplate()
		}
		fetchData();
	}, []);

	return (
		<div className="app">
			{view.userIsAuth && <Canvas />}
			<ToolBar />
			<Header />
			<DialoguePanelManager />
			{view.showLoader && <Spinner />}
			{/* <MenuGuide /> */}
		</div>
	);
}





export default App;
