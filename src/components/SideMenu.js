import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { eMode, PDF_VIEWERS, getUnlockDigits } from "../constants";
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
  setUnlockCount,
} from "../features/viewSlice";

import { unlinkMachine, saveUnlockCount } from "../services/localLicenseMananger";

const styleModules = { ...buttonStyles, ...menuStyles, ...uiStyles };
const cx = makeCx(styleModules);

const isElectron = !!window.electronAPI;

const LockIcon = ({ cx }) => (
  <svg className={cx("menu-row-lock")} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

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
    saveUnlockCount(0);
    dispatch(setUnlockCount(0));
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

  // Per-item lock state — see getUnlockDigits above for the digit mapping.
  const unlockDigits = getUnlockDigits(view.unlockCount);
  const speechBuilderLocked = !unlockDigits[0];

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
              className={cx(`menu-row ${!inPdfViewer ? "active" : ""} ${speechBuilderLocked ? "locked" : ""}`)}
              onClick={speechBuilderLocked ? undefined : onOpenSpeechBuilder}
              disabled={!inPdfViewer || speechBuilderLocked}
            >
              <img className={cx("menu-row-icon-90")} src={`./imgs/gui/add-template.png`} /> NDP3® Speech Builder
              {!inPdfViewer && !speechBuilderLocked && <span className={cx("menu-row-badge")}>Viewing</span>}
              {speechBuilderLocked && <LockIcon cx={cx} />}
            </button>
          </div>

          <div style={{ padding: "0 10px" }}>
            {PDF_VIEWERS.map(({ mode, label }, index) => {
              const active = view.mode === mode;
              const locked = !unlockDigits[index + 1];
              return (
                <button
                  key={mode}
                  className={cx(`menu-row ${active ? "active" : ""} ${locked ? "locked" : ""}`)}
                  onClick={locked ? undefined : () => onOpenPdfViewer(mode)}
                  disabled={active || locked}
                >
                  <img src={`./imgs/gui/open-pdf.png`} /> {label}
                  {active && !locked && <span className={cx("menu-row-badge")}>Viewing</span>}
                  {locked && <LockIcon cx={cx} />}
                </button>
              );
            })}
          </div>

          <hr className={cx("menu-divider")} />

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
              File storage information
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
