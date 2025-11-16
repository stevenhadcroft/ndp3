import { eMode } from "../constants";
import { useSelector, useDispatch } from "react-redux";
import CSSModules from "react-css-modules";
import buttonStyles from "../styles/buttons.module.css";
import menuStyles from "../styles/menu.module.css";
import uiStyles from "../styles/ui.module.css";

import { 
  showLoader,
  setMenuOpen,
	setMode, 
  setGeneric
} from "../features/viewSlice";

import {unlinkMachine} from '../services/localLicenseMananger';

const styleModules = { ...buttonStyles, ...menuStyles, ...uiStyles };

const Header = (props) => {
  const view = useSelector((state) => state.view);
  const dispatch = useDispatch();
  const mode = view.mode;

  const onSetMode = (m) => dispatch(setMode(m));

  // const onNewProject = (orientation) => {
  //   window.orientation = orientation; // TODO IMPROVE
  //   if (window.undoHistory && window.undoHistory.length > 0) {
  //     dispatch(setMode(eMode.NEW_PROJECT));
  //   } else {
  //     dispatch(newProject());
  //   }
  //   dispatch(setMenuOpen(false));
  // };


  const onMenuClose = () => {
    dispatch(setMenuOpen(false));
    // ()=>onSetMode(null)
  };

  const onSignOut = () => {
    dispatch(showLoader(false));
    dispatch(setMenuOpen(false));
    unlinkMachine();
    dispatch(setMode(eMode.USER_OPTIONS));
    dispatch(setGeneric({key:"userIsAuth", value:false}))
  };
  
  const onMenuOpen = () => {
		dispatch(setMenuOpen(!view.showMenuPopup));
	};
	

  window.UNSAFELY_CALL_onSignOut = onSignOut;

  const onCloseApp = () => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send('close-app');
    } else {
      window.close(); // Fallback for non-Electron environments
    }
  };

  let Buttons = () => {
    return (
      <div styleName="menu-container" style={{ width: "100%" }}>

        {/* <button styleName="menu-row"
                // style={{border:"none", marginTop:"100px"}}
                // onClick={() => onSetMode(eMode.SAVE_PROJECT)}
                >
                Add new image packs
              </button> */}

        {view.userIsAuth &&
        <div style={{ padding: "0 20px" }}>
          <button styleName="menu-row" onClick={onSignOut}>Sign out</button>
        </div>
        }

        <div style={{ padding: "0 20px" }}>
          <button styleName="menu-row" onClick={onCloseApp}>Exit Speech Builder</button>
        </div>
      </div>
    );
  };
  Buttons = CSSModules(Buttons, styleModules, { allowMultiple: true });

  return (
    <header>

      {!view.fullScreen && 
      <div styleName="menu-header">
        <button styleName="menutab" onClick={onMenuOpen}>
          {!view.showMenuPopup && <img src="./imgs/gui/menu.png" alt=""/>}
          {view.showMenuPopup && <img src="./imgs/gui/close.png" alt=""/>}
          </button>
				{/* <button styleName="icon small" onClick={onMenuClose} style={{ top: "10px", left: "5px", position: "absolute" }}>
          <img src="./imgs/gui/close_dark.png" alt="" />
        </button> */}

        <button styleName="menutab" >
          <span styleName="title"><strong>NDP3</strong><sup>&reg;</sup> Speech Builder</span>
        </button>
      </div>
      }

      {/* -------- POPUP -------- */}
      <div styleName={`bg-panel ${view.showMenuPopup ? "open" : "closed"}`}>
        <div styleName="popup-header"></div>
        <Buttons />
        {/* <button styleName="icon small" onClick={onMenuClose} style={{ top: "10px", left: "5px", position: "absolute" }}>
          <img src="./imgs/gui/close_dark.png" alt="" />
        </button> */}
      </div>
      {/* )} */}
    </header>
  );
};

export default CSSModules(Header, styleModules, { allowMultiple: true });
