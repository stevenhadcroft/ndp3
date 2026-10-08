import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { eMode, PDF_VIEWERS, getUnlockStates } from "../constants";
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

const BUY_URL = "https://www.ndp3.org/buy-ndp3-online/";

// Locked rows render as a link to BUY_URL rather than a plain div: rolling
// over swaps the product name for "{name} - Unlock" (see .menu-row.locked
// .menu-row-label-default/-hover in menu.module.css) and the whole row
// becomes clickable, not just a separate "Unlock" link.
const LockedRowLabel = ({ cx, name }) => (
  <>
    <span className={cx("menu-row-label-default")}>{name}</span>
    <span className={cx("menu-row-label-hover")}>{name} - Unlock</span>
  </>
);

// Padlock by default; swaps for an external-link icon on rollover (same
// slot - see .menu-row-lock-default/-hover in menu.module.css), signalling
// the row is now a link out to BUY_URL.
const LockIcon = ({ cx }) => (
  <svg className={cx("menu-row-lock menu-row-lock-default")} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const ExternalLinkIcon = ({ cx }) => (
  <svg className={cx("menu-row-lock menu-row-lock-hover")} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
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

  // Per-item lock state — see getUnlockStates above for the digit mapping.
  const unlockStates = getUnlockStates(view.unlockCount);
  const speechBuilderLocked = !unlockStates[0].unlocked;
  // trialDaysLeft is only 0 (rather than null) once a trial has actually run
  // out - distinguishes "expired" from "never unlocked" (digit 0).
  const speechBuilderExpired = speechBuilderLocked && unlockStates[0].trialDaysLeft === 0;

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
            {speechBuilderLocked ? (
              <a className={cx("menu-row locked")} href={BUY_URL} target="_blank" rel="noopener noreferrer">
                <img className={cx("menu-row-icon-90")} src={`./imgs/gui/add-template.png`} />
                <LockedRowLabel cx={cx} name="NDP3® Speech Builder" />
                <LockIcon cx={cx} />
                <ExternalLinkIcon cx={cx} />
                {speechBuilderExpired && <span className={cx("menu-row-badge expired")}>Expired</span>}
              </a>
            ) : (
              <button
                className={cx(`menu-row ${!inPdfViewer ? "active" : ""}`)}
                onClick={onOpenSpeechBuilder}
                disabled={!inPdfViewer}
              >
                <img className={cx("menu-row-icon-90")} src={`./imgs/gui/add-template.png`} /> <span className={cx("menu-row-label")}>NDP3® Speech Builder</span>
                {!inPdfViewer && <span className={cx("menu-row-badge")}>Viewing</span>}
              </button>
            )}
          </div>

          <div style={{ padding: "0 10px" }}>
            {PDF_VIEWERS.map(({ mode, label }, index) => {
              const active = view.mode === mode;
              const locked = !unlockStates[index + 1].unlocked;
              const expired = locked && unlockStates[index + 1].trialDaysLeft === 0;
              if (locked) {
                return (
                  <a key={mode} className={cx("menu-row locked")} href={BUY_URL} target="_blank" rel="noopener noreferrer">
                    <img src={`./imgs/gui/open-pdf.png`} />
                    <LockedRowLabel cx={cx} name={label} />
                    <LockIcon cx={cx} />
                    <ExternalLinkIcon cx={cx} />
                    {expired && <span className={cx("menu-row-badge expired")}>Expired</span>}
                  </a>
                );
              }
              return (
                <button
                  key={mode}
                  className={cx(`menu-row ${active ? "active" : ""}`)}
                  onClick={() => onOpenPdfViewer(mode)}
                  disabled={active}
                >
                  <img src={`./imgs/gui/open-pdf.png`} /> <span className={cx("menu-row-label")}>{label}</span>
                  {active && <span className={cx("menu-row-badge")}>Viewing</span>}
                </button>
              );
            })}
          </div>

          <hr className={cx("menu-divider")} />

          <div style={{ padding: "0 10px" }}>
            <button className={cx("menu-row")} onClick={onSignOut}>
              <img src={`./imgs/gui/sign-out.png`} /> <span className={cx("menu-row-label")}>Sign out</span>
            </button>
          </div>

          <div style={{ padding: "0 10px" }}>
            <button className={cx("menu-row")} onClick={onCloseApp}>
              <img src={`./imgs/gui/quit-app.png`} /> <span className={cx("menu-row-label")}>Close application</span>
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
