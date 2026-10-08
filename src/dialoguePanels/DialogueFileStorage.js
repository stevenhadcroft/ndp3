import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { cx } from '../styles';
import DraggablePanel from "./DraggablePanel";

import { cancelMode } from "../features/viewSlice";
import { getCurrentUser } from "../services/localLicenseMananger";

const isElectron = !!window.electronAPI;

const pathBoxStyle = {
    marginTop: "12px",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "var(--color-overlay-dark)",
    fontFamily: "monospace",
    fontWeight: "normal",
    fontSize: "14px",
    wordBreak: "break-all",
    userSelect: "text",
};

const DialogueFileStorage = () => {

    // HOOKS ---------------------------------------------------
    const dispatch = useDispatch();
    const [path, setPath] = useState('');
    const [myImagesPath, setMyImagesPath] = useState('');

    useEffect(() => {
        if (!isElectron) return;

        const userId = getCurrentUser();

        window.electronAPI.getProjectsPath?.(userId)
            .then((p) => setPath(p || ''))
            .catch(() => setPath(''));

        window.electronAPI.getMyImagesPath?.(userId)
            .then((p) => setMyImagesPath(p || ''))
            .catch(() => setMyImagesPath(''));
    }, []);

    // HANDLERS ---------------------------------------------------
    const onClose = () => dispatch(cancelMode());

    const onOpenFolder = () => {
        window.electronAPI?.openProjectsFolder?.(getCurrentUser());
    };

    const onOpenMyImagesFolder = () => {
        window.electronAPI?.openMyImagesFolder?.(getCurrentUser());
    };

    const Buttons = (
        <button className={cx("secondary narrow")} onClick={onClose}>Close</button>
    )

    //--------------------------------------------------------------
    // Main
    //--------------------------------------------------------------
    return (
        <DraggablePanel id='dialogue-file-storage' title="File storage" type="modal" buttons={Buttons}>
            <div className={cx("dialogue-inner center")}>
                <div className={cx("dark-background")} style={{ maxWidth: "500px" }}>
                    <p>Your projects are saved as files on this computer, in the folder below.</p>
                    <div style={pathBoxStyle}>
                        {isElectron ? (path || "Locating…") : "Only available in the desktop app."}
                    </div>

                    {isElectron && (
                        <button
                            className={cx("primary")}
                            style={{ marginTop: "16px" }}
                            onClick={onOpenFolder}
                            disabled={!path}
                        >
                            Open folder
                        </button>
                    )}

                    <p style={{ marginTop: "28px" }}>
                        Images you add through "My images" are stored in this folder.
                    </p>
                    <div style={pathBoxStyle}>
                        {isElectron ? (myImagesPath || "Locating…") : "Only available in the desktop app."}
                    </div>

                    {isElectron && (
                        <button
                            className={cx("primary")}
                            style={{ marginTop: "16px" }}
                            onClick={onOpenMyImagesFolder}
                            disabled={!myImagesPath}
                        >
                            Open folder
                        </button>
                    )}
                </div>
            </div>
        </DraggablePanel>
    );
}

export default DialogueFileStorage;
