import { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import useNudgeKeyboardHandler from "./hooks/useNudgeKeyboardHandler";
import useDefaultTemplate from "./hooks/useDefaultTemplate"; 
import useCanvasResize from "./hooks/useResizeCanvas";
import { setMode, setAppUpdateStatus, setUserIsAuth } from "./features/viewSlice";
import { eMode } from "./constants";
import { checkLocalLicense } from './services/localLicenseMananger';
import Canvas from "./components/Canvas";
import ToolBar from "./components/ToolBar";
import Header from "./components/Header";
import SideMenu from "./components/SideMenu";
import { Spinner } from "./components/UIkit/Spinner";
import DialoguePanelManager from "./dialoguePanels/PanelManager";
import { loadImageDirectoryData } from "./loaders";

const App = () => {

	const dispatch = useDispatch();
	const view = useSelector(state => state.view);
	const loadDefaultTemplate = useDefaultTemplate();
	useNudgeKeyboardHandler();
	useCanvasResize();
	
	// Progress bar handling
	useEffect(() => {
		if (window && window.electronAPI) {
			window.electronAPI.onUpdateProgress((event, progress) => {
				dispatch(setMode(eMode.APP_UPDATING));
				dispatch(setAppUpdateStatus({ percent: progress.percent }));
			});
			window.electronAPI.onUpdateError(() => {
				dispatch(setAppUpdateStatus({}));
				dispatch(setMode(null));
			});
		}
	}, []);

	useEffect(() => {
		async function fetchData() {
			await loadImageDirectoryData();
			const licence = await checkLocalLicense();
			dispatch(setUserIsAuth(licence))
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
			<SideMenu />
			<DialoguePanelManager />
			{view.showLoader && <Spinner />}
		</div>
	);
}





export default App;
