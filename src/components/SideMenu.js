import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { eMode } from "../constants";
import { makeCx } from "../styles";
import buttonStyles from "../styles/buttons.module.css";
import menuStyles from "../styles/menu.module.css";
import uiStyles from "../styles/ui.module.css";

import {
  showLoader,
  setMenuOpen,
  setMode,
  cancelMode,
  setUserIsAuth,
} from "../features/viewSlice";

import { unlinkMachine } from "../services/localLicenseMananger";

const styleModules = { ...buttonStyles, ...menuStyles, ...uiStyles };
const cx = makeCx(styleModules);

const isElectron = !!window.electronAPI;

const PDF_VIEWERS = [
  { mode: eMode.PDF_VIEWER_THERAPY_MANUAL, label: "Therapy Manual" },
  { mode: eMode.PDF_VIEWER_SPEECH_ASSESSMENT, label: "Speech Assessment" },
  { mode: eMode.PDF_VIEWER_THERAPY_WORKSHEETS, label: "Therapy Worksheets" },
  { mode: eMode.PDF_VIEWER_ARTICULOGRAMS, label: "Articulograms" },
];

const SideMenu = () => {
  const view = useSelector((state) => state.view);
  const dispatch = useDispatch();
  const [version, setVersion] = useState("");

  const onSignOut = () => {
    dispatch(showLoader(false));
    dispatch(setMenuOpen(false));
    unlinkMachine();
    dispatch(setMode(eMode.USER_OPTIONS));
    dispatch(setUserIsAuth(false));
  };

  window.UNSAFELY_CALL_onSignOut = onSignOut;

  const onOpenPdfViewer = (mode) => {
    dispatch(setMenuOpen(false));
    dispatch(setMode(mode));
  };

  const onOpenSpeechBuilder = () => {
    dispatch(setMenuOpen(false));
    dispatch(cancelMode());
  };

  const onOpenFileStorage = () => {
    dispatch(setMenuOpen(false));
    dispatch(setMode(eMode.FILE_STORAGE));
  };

  const inPdfViewer = PDF_VIEWERS.some(({ mode }) => mode === view.mode);

  const onCloseApp = () => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send("close-app");
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

  return (
    <>
      {view.showMenuPopup && (
        <div
          className={cx("bg-panel-backdrop")}
          onClick={() => dispatch(setMenuOpen(false))}
        />
      )}
      <div className={cx(`bg-panel ${view.showMenuPopup ? "open" : "closed"}`)}>
        <div className={cx("popup-header")}></div>

        <div className={cx("menu-container")} style={{ width: "100%" }}>
          <div style={{ padding: "0 10px" }}>
            <button
              className={cx(`menu-row ${!inPdfViewer ? "active" : ""}`)}
              onClick={onOpenSpeechBuilder}
              disabled={!inPdfViewer}
            >
              <img className={cx("menu-row-icon-90")} src={`./imgs/gui/add-template.png`} /> NDP3® Speech Builder
              {!inPdfViewer && <span className={cx("menu-row-badge")}>Viewing</span>}
            </button>
          </div>

          <div style={{ padding: "0 10px" }}>
            {PDF_VIEWERS.map(({ mode, label }) => {
              const active = view.mode === mode;
              return (
                <button
                  key={mode}
                  className={cx(`menu-row ${active ? "active" : ""}`)}
                  onClick={() => onOpenPdfViewer(mode)}
                  disabled={active}
                >
                  <img src={`./imgs/gui/open-pdf.png`} /> {label}
                  {active && <span className={cx("menu-row-badge")}>Viewing</span>}
                </button>
              );
            })}
          </div>

          <div style={{ padding: "0 10px" }}>
            <button className={cx("menu-row")} onClick={onSignOut}>
              <img src={`./imgs/gui/sign-out.png`} /> Sign out
            </button>
          </div>

          <div style={{ padding: "0 10px" }}>
            <button className={cx("menu-row")} onClick={onCloseApp}>
              <img src={`./imgs/gui/quit-app.png`} /> Quit NDP3® Speech Builder
            </button>
          </div>

          {isElectron && (
            <button className={cx("menu-storage-link")} onClick={onOpenFileStorage}>
              File storage
            </button>
          )}

          <div style={{ position: "absolute", padding: "20px", bottom: "80px", fontSize: "12px" }}>
            Version {version}
          </div>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
