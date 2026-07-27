import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { eMode } from "../constants";
import { makeCx } from "../styles";
import buttonStyles from "../styles/buttons.module.css";
import menuStyles from "../styles/menu.module.css";
import uiStyles from "../styles/ui.module.css";
// import packageJson from '../../package.json';

import {
  showLoader,
  setMenuOpen,
	setMode,
  setUserIsAuth,
} from "../features/viewSlice";

import {unlinkMachine} from '../services/localLicenseMananger';

const styleModules = { ...buttonStyles, ...menuStyles, ...uiStyles };
const cx = makeCx(styleModules);

const Header = (props) => {
  const view = useSelector((state) => state.view);
  const canvas = useSelector((state) => state.canvas);
  const dispatch = useDispatch();
  const [version, setVersion] = useState('');

  const projectLabel = canvas.projectName
    ? `${canvas.projectName}${canvas.modified ? ' *' : ''}`
    : '(Project unsaved)';

  const onSignOut = () => {
    dispatch(showLoader(false));
    dispatch(setMenuOpen(false));
    unlinkMachine();
    dispatch(setMode(eMode.USER_OPTIONS));
    dispatch(setUserIsAuth(false))
  };
  
  const onMenuOpen = () => {
		dispatch(setMenuOpen(!view.showMenuPopup));
	};

  const onOpenPdfViewer = (mode) => {
    dispatch(setMenuOpen(false));
    dispatch(setMode(mode));
  };


  window.UNSAFELY_CALL_onSignOut = onSignOut;

  const onCloseApp = () => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send('close-app');
    } else {
      window.close(); // Fallback for non-Electron environments
    }
  };

  useEffect(() => {
    const fetchVersion = async () => {
      if (window.electronAPI && window.electronAPI.getVersion) {
        const v = await window.electronAPI.getVersion();
        setVersion(v);
      }
    };
    fetchVersion();
  }, []);

  const Buttons = () => {
    return (
      <div className={cx("menu-container")} style={{ width: "100%" }}>

        <div style={{ padding: "0 10px" }}>
          <button className={cx("menu-row")} onClick={() => onOpenPdfViewer(eMode.PDF_VIEWER_THERAPY_MANUAL)}>
            <img src={`./imgs/gui/open-pdf.png`}/> Therapy Manual
          </button>
          <button className={cx("menu-row")} onClick={() => onOpenPdfViewer(eMode.PDF_VIEWER_SPEECH_ASSESSMENT)}>
            <img src={`./imgs/gui/open-pdf.png`}/> Speech Assessment
          </button>
          <button className={cx("menu-row")} onClick={() => onOpenPdfViewer(eMode.PDF_VIEWER_THERAPY_WORKSHEETS)}>
            <img src={`./imgs/gui/open-pdf.png`}/> Therapy Worksheets
          </button>
          <button className={cx("menu-row")} onClick={() => onOpenPdfViewer(eMode.PDF_VIEWER_ARTICULOGRAMS)}>
            <img src={`./imgs/gui/open-pdf.png`}/> Articulograms
          </button>
        </div>

        <div style={{ padding: "0 10px" }}>
          <button className={cx("menu-row")} onClick={onSignOut}>
            <img src={`./imgs/gui/sign-out.png`}/> Sign out
          </button>
        </div>

        <div style={{ padding: "0 10px" }}>
          <button className={cx("menu-row")} onClick={onCloseApp}>
            <img src={`./imgs/gui/quit-app.png`}/> Quit NDP3 Speech Builder
          </button>
        </div>

        <div style={{ position:"absolute", padding:"20px", bottom:"80px", fontSize: "12px" }}>
          Version {version}
        </div>

      </div>
    );
  };

  const imgsrc = view.showMenuPopup ? "./imgs/gui/close.png" : "./imgs/gui/menu.png";
  const headstr = view.showMenuPopup ? <span style={{marginLeft:"-16px"}}>Close menu</span> : <><strong>NDP3</strong><sup>&reg;</sup> Speech Builder</>;
  
  return (
    <header>
      {!view.fullScreen &&
      <div className={cx("menu-header")}>
        {view.userIsAuth &&
          <button className={cx("menutab")} onClick={onMenuOpen}><img src={imgsrc} alt=""/></button>
        }
        <button className={cx("menutab")} >
          <span className={cx("title")}>{headstr}</span>
        </button>
        {view.userIsAuth &&
          <span className={cx(`project-name ${canvas.modified ? "modified" : ""}`)}>{projectLabel}</span>
        }
      </div>
      }

      {/* -------- POPUP -------- */}
      <div className={cx(`bg-panel ${view.showMenuPopup ? "open" : "closed"}`)}>
        <div className={cx("popup-header")}></div>
        <Buttons />
      </div>
    </header>
  );
};

export default Header;
