import { Fragment, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux'
import CSSModules from 'react-css-modules';
import { Constants } from "./constants";
import styles from './styles/';
import DraggablePanel from "./DraggablePanel";
import Swal from 'sweetalert2';

import {
    getProjectList,
    getProject,
    storeProject,
    deleteProject,
    createDir,
    deleteDir,
    getDirs,
} from './services/projectFileManangerCloud';
// } from './services/projectFileManangerDB';

import {
    setTextData,
    fileLoadUpdate,
    setDir,
    showLoader
} from './actions'

import { 
    cancelMode, 
    showPhonetics,
    addPhonetic,
    setOrientation
} from "./features/viewSlice";

import { 
    resetCanvas,
    setTemplateData,
    setImageData,
} from "./features/canvasSlice";

import { cloneDeep, makeSVGgrabbable, makeSVGgrabbableReset } from "./utils";
import html2canvas from "html2canvas";


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
    const [listData, setListData] = useState([]);
    const [dirData, setDirData] = useState([]);
    
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
            .catch(()=>{
                Swal.fire({
                    title: 'Sorry, we have a problem!',
                    text: 'The project can not be accessed',
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
        inputRef.current.value = file.name;
    }
    const onDirectoryClick = (dir, index) => {
        setFile(dir); // NOT SURE THIS IS GOOD!?!?!?!
        setSelectedDirectoryId(index);
        setSelectedId(-1);
        inputRef.current.value = dir.dirname;
    }
    const onDeleteClick = () => {
        dispatch(showLoader(true));
        if (selectedId !== -1) {
            deleteProject(file).then(() => {
                refreshList();
                // dispatch(showLoader(false));
            });
        } else if (selectedDirectoryId !== -1) {
            deleteDir(file).then(() => {
                refreshList();
                // dispatch(showLoader(false));
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
        setFile(Object.assign(file || {}, { name: inputRef.current.value }));
        if (mode === 'open' || (selectedDirectoryId !== -1)) {
            if (selectedId !== -1) {
                
                if (window.LOCAL){ 
                    openProject(file);
                } else {
                    dispatch(showLoader(true));
                    file.projectid = file.id; // COULD BE CONFUSING LATER ON
                    getProject(file).then(data => { // ONLINE GOTTA LOAD IT
                        const parsed = JSON.parse(data);
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
            saveProject(file);
        }
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
        let data = window.LOCAL ? file.data : file;
        console.log("data ", data);
        if (data) {
            dispatch(setOrientation(data.orientation));
            dispatch(cancelMode());
            // dispatch(setBrushColour(null));
            dispatch(setTemplateData([]));
            dispatch(setImageData([]));
            dispatch(setTextData([]));
            dispatch(fileLoadUpdate({data}));
            
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
                
                // console.log('file ', file);

                const description = "";
                const dirname = view.currentDir;
                storeProject(file.name, Math.floor(file.id), description, thumbnail, projectData, dirname, canvas.orientation);
                
                // makeSVGgrabbableReset();
                
                if (view.mode === Constants.MODE_SAVE_BEFORE_NEW) {
                    // dispatch(newProject());
                    dispatch(cancelMode());
                    dispatch(resetCanvas());
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
        <Fragment>
            <button styleName="primary narrow red" onClick={() => setConfirmDelete(true)}>Delete</button>
            <button styleName="primary narrow blue" onClick={onCancelClick}>Cancel</button>
            <button styleName="primary narrow green" onClick={onCTAClick}>{mode}</button>
        </Fragment>
    )

    //--------------------------------------------------------------
    // Main
    //--------------------------------------------------------------
    return (
        <DraggablePanel id='dialogue-project' title={title} type="fullscreen" buttons={Buttons}>

            <div styleName="margin-bb margin-ll">
                <span styleName="margin-r">Project Name</span>
                <input type="text" styleName="with-phonetic" ref={inputRef} />
                <button styleName="add-phonetic large" style={{ position: "reletive", top: "3px" }} onClick={() => dispatch(showPhonetics(true))} />

                {!view.currentDir &&
                    <button style={{marginLeft:"30px"}} styleName="tertiary" onClick={setConfirmName}>Create folder
                        <img width="30px" style={{ marginLeft: "15px", marginBottom: "-13px" }} src={'./imgs/directory.png'} />
                    </button>
                }

                {view.currentDir &&
                    <Fragment>
                        <span style={{marginLeft:"30px"}}><span style={{fontWeight:"400"}}>Current folder</span> : {view.currentDir}</span>
                        <button style={{marginLeft:"30px"}} styleName="tertiary" onClick={onLeaveFolder} >Leave folder
                            <img width="30px" style={{ marginLeft: "15px", marginBottom: "-13px" }} src={'./imgs/directory.png'} />
                        </button>
                    </Fragment>
                }
            </div>

            {confirmDelete &&
                <Fragment>
                    <div styleName="dialogue-inner align-center" style={{ display: "block" }}>
                        <br /><br /><br /><br />
                        <div style={{ margin: "20px 0" }}>{`Are you sure you want to delete this ${selectedDirectoryId !== -1 ? "folder and all of its contents?" : "this project?"}`}</div>
                        <br /><br />
                        <div>
                            <button styleName="primary narrow blue" onClick={() => setConfirmDelete(false)}>Cancel</button>
                            <button styleName="primary narrow red" onClick={onDeleteClick}>Delete</button>
                        </div>
                    </div>
                </Fragment>
            }

            {confirmName &&
                <Fragment>
                    <div styleName="dialogue-inner align-center" style={{ display: "block" }}>
                        <br /><br /><br /><br />
                        <span style={{ margin: "20px 0" }}>Please enter folder name?</span>
                        &nbsp;&nbsp;
                        <input type="text" style={{ width: "300px" }} ref={inputRefCreateFolder} />
                        <br /><br /><br /><br />
                        <div>
                            <button styleName="primary narrow blue" onClick={() => setConfirmName(false)}>Cancel</button>
                            <button styleName="primary narrow green" onClick={onCreateDirClick}>Submit</button>
                        </div>
                    </div>
                </Fragment>
            }

            {!(confirmDelete || confirmName) &&
                <div styleName="dialogue-inner">
                    {/* -------  directories -------  */}
                    {dirData && dirData.map((dir, index) => {
                        const selected = index === selectedDirectoryId ? 'selected' : '';
                        let show = true;
                        if (show) {
                            return (
                                <div key={index} style={{position:"relative"}}>
                                    <img key={index}
                                        alt=""
                                        styleName={`cell transparent tall ${selected}`}
                                        style={{ background: 'transparent' }}
                                        src={'./imgs/directory.png'}
                                        onClick={() => onDirectoryClick(dir, index)} />
                                    <div styleName="cell-title">{(dir && dir.dirname) || "(no name)"}</div>
                                    {/* <input type="text" styleName="title"/> */}

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
                                        styleName={`cell ${orientation} ${selected}`}
                                        src={file && file.thumbnail} // base64 data 
                                        onClick={() => onProjectClick(file, index)} />
                                    <div styleName="cell-title">{(file && file.name) || "(no name)"}</div>
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

export default CSSModules(DialogueProject, styles, { allowMultiple: true });






