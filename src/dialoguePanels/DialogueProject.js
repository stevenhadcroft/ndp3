import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { eMode } from "../constants";
import { cx } from '../styles';
import DraggablePanel from "./DraggablePanel";
import Swal from 'sweetalert2';
import {
    showLoader,
    setDir,
    cancelMode,
    showPhonetics,
    addPhonetic,
} from "../features/viewSlice";
import {
    resetCanvas,
    setOrientation,
    fileLoadUpdate,
    setProjectName,
    markSaved,
    markLoadStart,
} from "../features/canvasSlice";
import { cloneDeep, makeSVGgrabbable, makeSVGgrabbableReset } from "../utils";
import html2canvas from "html2canvas";

import {
    getProjectList,
    getProject,
    storeProject,
    deleteProject,
    createDir,
    deleteDir,
    getDirs,
} from '../services/projectFileMananger';

function DialogueProject({ mode }) {

    // HOOKS ---------------------------------------------------
    const dispatch = useDispatch();
    const inputRef = useRef();
    const inputRefCreateFolder = useRef();
    const view = useSelector(state => state.view);
    const canvas = useSelector(state => state.canvas);

    const [selectedId, setSelectedId] = useState(-1);
    const [selectedDirectoryId, setSelectedDirectoryId] = useState(-1);
    const [file, setFile] = useState({});
    const [confirmDelete, setConfirmDelete] = useState();
    const [confirmName, setConfirmName] = useState();
    const [confirmOverwrite, setConfirmOverwrite] = useState();
    const [listData, setListData] = useState([]);
    const [dirData, setDirData] = useState([]);
    const [deleteError, setDeleteError] = useState("");
    
    useEffect(() => {
        refreshList();
    }, [])

    // if phonetic changes then add
    useEffect(() => {
        if (!view.phoneticToAdd) return;
        const newFileName = inputRef.current.value + view.phoneticToAdd;
        inputRef.current.value = newFileName;
        dispatch(addPhonetic(null)); // clear out
    }, [view.phoneticToAdd])

    // overide if opening a folder whilst saving
    mode = mode === "open" || selectedDirectoryId !== -1 ? "open" : "save";

    const title = `${(mode === "open" || selectedDirectoryId !== -1) ? "Open" : "Save"} Project`;

    const refreshList = (dirname) => {
        dispatch(showLoader(true));
        if (!dirname && dirname !== '') dirname = view.currentDir;
        
        getProjectList(dirname)
            .then(evt => {
                let projects = evt.projects || [];
                projects = projects.filter(p => p.dirname === dirname || (!p.dirname && !dirname));
                
                //if in a directory don't show dirs
                if (dirname){
                    setDirData([]);
                    setListData(projects);
                    dispatch(showLoader(false));
                }  else {
                    //otherwise get dirss
                    getDirs()
                        .then(evt => {
                            setListData(projects);
                            const dirs = evt.data;
                            setDirData(dirs);
                            dispatch(showLoader(false));
                        })
                        .catch(()=>{
                            dispatch(cancelMode());
                            dispatch(showLoader(false));
                        })
                }
            })
            .catch((evt)=>{
                Swal.fire({
                    title: 'Sorry, we have a problem!',
                    text: JSON.stringify(evt),
                    icon: 'error',
                    confirmButtonText: 'Continue'
                });
                dispatch(cancelMode());
                dispatch(showLoader(false));
            })
    }

    // HANDLERS ---------------------------------------------------
    const onProjectClick = (file, index) => {
        setFile(file);
        setSelectedId(index);
        setSelectedDirectoryId(-1);
        setDeleteError("");
        inputRef.current.value = file.name;
    }
    const onDirectoryClick = (dir, index) => {
        setFile(dir); // NOT SURE THIS IS GOOD!?!?!?!
        setSelectedDirectoryId(index);
        setSelectedId(-1);
        setDeleteError("");
        inputRef.current.value = dir.dirname;
    }
    const onDeleteRequest = () => {
        if (selectedId === -1 && selectedDirectoryId === -1) {
            setDeleteError("Please select a project or folder to delete.");
            return;
        }
        setDeleteError("");
        setConfirmDelete(true);
    }
    const onDeleteClick = () => {
        dispatch(showLoader(true));
        if (selectedId !== -1) {
            deleteProject(file).then(() => {
                refreshList();
            });
        } else if (selectedDirectoryId !== -1) {
            deleteDir(file).then(() => {
                refreshList();
            });
        }
        setFile(null);
        setSelectedId(-1);
        setSelectedDirectoryId(-1);
        setConfirmDelete(false);
    }
    const onCancelClick = () => {
        setSelectedId(-1);
        setFile(null);
        dispatch(cancelMode());
    }
    const onCTAClick = () => {
        setFile(Object.assign({}, file || {}, { name: inputRef.current.value }));
        if (mode === 'open' || (selectedDirectoryId !== -1)) {
            if (selectedId !== -1) {

                if (window.LOCAL){
                    openProject(file);
                } else {
                    dispatch(showLoader(true));
                    file.projectid = file.id; // COULD BE CONFUSING LATER ON
                    getProject(file).then(data => { // ONLINE GOTTA LOAD IT
                        console.log('getProject() data ', data);
                        const parsed = JSON.parse(data);
                        parsed.name = file.name; // carry name through to openProject
                        openProject(parsed);
                        dispatch(showLoader(false));
                    });
                }

            } else if (selectedDirectoryId !== -1) {
                dispatch(setDir(file.dirname));
                setSelectedDirectoryId(-1);
                refreshList(file.dirname);
            }
        } else if (mode === 'save') {
            const typedName = (inputRef.current.value || "").trim();
            if (!typedName) {
                setDeleteError("Please enter a project name before saving.");
                return;
            }
            setDeleteError("");
            const existing = listData.find(p => p.name === typedName);
            if (existing) {
                setConfirmOverwrite(existing);
                return;
            }
            saveProject(Object.assign({}, file, { name: typedName }));
        }
    }

    const onOverwriteConfirm = () => {
        const target = Object.assign({}, confirmOverwrite, { name: inputRef.current.value });
        setConfirmOverwrite(null);
        saveProject(target);
    }

    const onCreateDirClick = () => {
        const dirname = inputRefCreateFolder.current.value;
        createDir(dirname).then(() => refreshList());
        setConfirmName(false);
    }

    const onLeaveFolder = () => {
        dispatch(setDir(null));
        setSelectedDirectoryId(-1);
        refreshList('');
    }

    //------------------------------------------------------------------------
    // open and save
    //------------------------------------------------------------------------
    const openProject = (file) => {
        console.log('openProject() file ', file);
        let data = window.LOCAL ? file.data : file;
        if (data) {
            dispatch(cancelMode());
            dispatch(resetCanvas());
            dispatch(markLoadStart());
            dispatch(setOrientation(data.orientation));
            dispatch(setProjectName(file.name));
            dispatch(fileLoadUpdate(data));
        } else {
            alert('ERROR : no file data')
        }
    };

    const saveProject = (file) => {
        // makeSVGgrabbable(view);
        dispatch(showLoader(true));

        html2canvas(document.querySelector("#canvas")) // DO SAVE - createthumb first
            .then(canvasNode => {
                const thumbnail = canvasNode.toDataURL("image/png");
                
                let projectData = { 
                    imageData       : cloneDeep(canvas.images), 
                    templateData    : cloneDeep(canvas.template), 
                    textData        : canvas.texts,
                    orientation     : canvas.orientation // for used on load (file data used for thumbnail etc)
                };

                // clear out SVG data
                if (projectData.imageData) projectData.imageData.forEach(image => delete(image.svg))
                delete(projectData.templateData.svg)

                storeProject({
                    name:file.name,
                    projectid:Math.floor(file.id),
                    description:"",
                    thumbnail,
                    data:projectData,
                    dirname:view.currentDir,
                    orientation:canvas.orientation
                })

                if (view.mode === eMode.SAVE_BEFORE_NEW) {
                    dispatch(resetCanvas());
                } else {
                    dispatch(markSaved(file.name));
                }

                dispatch(cancelMode());
                dispatch(showLoader(false));
            });
    };



    //--------------------------------------------------------------
    // Methods
    //--------------------------------------------------------------
    // const doDelete = () =>{
    //     onDelete(file).then(()=>refreshList());
    //     setSelectedId(null);
    //     setFile(null);
    // }

    //--------------------------------------------------------------
    // Buttons
    //--------------------------------------------------------------
    const Buttons = (
        <>
            <button className={cx("secondary narrow")} onClick={onCancelClick}>Cancel</button>
            <button className={cx("primary narrow")} onClick={onCTAClick}>{mode === "open" ? "Open" : "Save"}</button>
        </>
    )

    //--------------------------------------------------------------
    // Main
    //--------------------------------------------------------------
    return (
        <DraggablePanel id='dialogue-project' title={title} type="fullscreen" buttons={Buttons}>

            <div className={cx("margin-bb margin-ll")} style={{ display: "flex", alignItems: "center" }}>
                <span className={cx("margin-r")}>Project Name</span>
                <input type="text" className={cx("with-phonetic")} ref={inputRef} />
                <button className={cx("add-phonetic large")} onClick={() => dispatch(showPhonetics(true))} />

                {!view.currentDir &&
                    <button style={{marginLeft:"30px"}} className={cx("tertiary")} onClick={setConfirmName}>
                        <img width="20px" style={{ marginRight: "8px" }} src={'./imgs/directory.png'} />
                        Create folder
                    </button>
                }

                {view.currentDir &&
                    <>
                        <span style={{marginLeft:"30px"}}><span style={{fontWeight:"400"}}>Current folder</span> : {view.currentDir}</span>
                        <button style={{marginLeft:"30px"}} className={cx("tertiary")} onClick={onLeaveFolder} >
                            <img width="20px" style={{ marginRight: "8px" }} src={'./imgs/directory.png'} />
                            Leave folder
                        </button>
                    </>
                }

                <button className={cx("primary narrow red")} style={{ marginLeft: "auto" }} onClick={onDeleteRequest}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "8px", marginBottom: "-3px" }}>
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                    {selectedDirectoryId !== -1 ? "Delete folder and contents" : "Delete project"}
                </button>
            </div>

            {confirmDelete &&
                <>
                    <div className={cx("dialogue-inner align-center")} style={{ display: "block" }}>
                        <div className={cx("margin-ttt")}>
                            <div>
                                {`Are you sure you want to delete this ${selectedDirectoryId !== -1 ? "folder and all of its contents?" : "project?"}`}
                            </div>
                            <br /><br />
                            <div>
                                <button className={cx("secondary narrow")} onClick={() => setConfirmDelete(false)}>Cancel</button>
                                <button className={cx("primary narrow")} onClick={onDeleteClick}>Delete</button>
                            </div>
                        </div>
                    </div>
                </>
            }

            {confirmOverwrite &&
                <>
                    <div className={cx("dialogue-inner align-center")} style={{ display: "block" }}>
                        <div className={cx("margin-ttt")}>
                            <div>Are you sure you want to save over this project?</div>
                            <br /><br />
                            <div>
                                <button className={cx("secondary narrow")} onClick={() => setConfirmOverwrite(null)}>Cancel</button>
                                <button className={cx("primary narrow")} onClick={onOverwriteConfirm}>Save and Replace</button>
                            </div>
                        </div>
                    </div>
                </>
            }

            {confirmName &&
                <div className={cx("dialogue-inner align-center")} style={{ display: "block" }}>
                    <div className={cx("create-folder-form")}>
                        <div className={cx("field-stack")}>
                            <div className={cx("field-label")}>Please enter folder name?</div>
                            <input type="text" ref={inputRefCreateFolder} />
                        </div>

                        <div className={cx("margin-ttt")}>
                            <button className={cx("secondary narrow")} onClick={() => setConfirmName(false)}>Cancel</button>
                            <button className={cx("primary narrow")} onClick={onCreateDirClick}>Submit</button>
                        </div>
                    </div>
                </div>
            }

            {!(confirmDelete || confirmName || confirmOverwrite) && deleteError &&
                <div style={{ color: "#ff5252", fontWeight: 600, padding: "0 20px 10px" }}>{deleteError}</div>
            }

            {!(confirmDelete || confirmName || confirmOverwrite) &&
                <div className={cx("dialogue-inner")}>
                    {/* -------  directories -------  */}
                    {dirData && dirData.map((dir, index) => {
                        const selected = index === selectedDirectoryId ? 'selected' : '';
                        let show = true;
                        if (show) {
                            return (
                                <div key={index} style={{position:"relative"}}>
                                    <img key={index}
                                        alt=""
                                        className={cx(`cell transparent tall ${selected}`)}
                                        style={{ background: 'transparent' }}
                                        src={'./imgs/directory.png'}
                                        onClick={() => onDirectoryClick(dir, index)} />
                                    <div className={cx("cell-title")}>{(dir && dir.dirname) || "(no name)"}</div>

                                </div>
                            )
                        } else {
                            return null
                        }
                    })}

                    {/* ------- projects -------  */}
                    {listData && listData.map((file, index) => {
                        let show = true;
                        // if (!file.data) return;
                        // const orientation = file.data && file.data.orientation === "landscape" ? "wide" : "tall";
                        const orientation = file.orientation === "landscape" ? "wide" : "tall";
                        const selected = index === selectedId ? 'selected' : '';

                        if (show) {
                            return (
                                <div key={index} style={{position:"relative"}}>
                                    <img key={index}
                                        alt=""
                                        className={cx(`cell ${orientation} ${selected}`)}
                                        src={file && file.thumbnail} // base64 data
                                        onClick={() => onProjectClick(file, index)} />
                                    <div className={cx("cell-title")}>{(file && file.name) || "(no name)"}</div>
                                </div>
                            )
                        } else {
                            return null
                        }
                    })}
                </div>
            }
        </DraggablePanel>
    );
}

export default DialogueProject;






