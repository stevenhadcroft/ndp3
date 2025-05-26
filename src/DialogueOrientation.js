import { useDispatch } from 'react-redux'
import { Constants } from "./constants";
import CSSModules from 'react-css-modules';
import styles from './styles/';

// import { 
//     // newProject, 
//     setMode, 
//     setMenuOpen
// } from './actions'

import { 
	cancelMode,
    setMenuOpen,
} from "./features/viewSlice";

import { 
	resetCanvas,
} from "./features/canvasSlice";


import DraggablePanel from "./DraggablePanel";


const DialogueOrientation = () => {

    // HOOKS ---------------------------------------------------
    const dispatch = useDispatch();

    // HANDLERS ---------------------------------------------------
    const onNewProject = (orientation) => {
        window.orientation = orientation; // TODO IMPROVE
        // if (window.undoHistory && window.undoHistory.length>0){
        //     dispatch(setMode(Constants.MODE_NEW_PROJECT));
        // } else {
        //     dispatch(newProject());
        // }
        // dispatch(newProject());
        dispatch(cancelMode());
        dispatch(resetCanvas());
        dispatch(setMenuOpen(false));
      };
    
    
    //--------------------------------------------------------------
	// Main
	//--------------------------------------------------------------
    return (
        <DraggablePanel type="modal">
            <div style={{marginBottom:"20px"}}>Do you want your new project to be landscape or portrait?</div>
            
            <button onClick={()=>onNewProject("portrait")}>
                <img src="./imgs/gui/new-portrait-2.png" style={{width:"100px", height:"auto", marginLeft:"5px"}}/>
                {/* Portrait */}
            </button>

            <button onClick={()=>onNewProject("landscape")}>
                 <img src="./imgs/gui/new-landscape-2.png"  style={{width:"100px", height:"auto", marginLeft:"40px"}}/>
            </button>
        </DraggablePanel>
	);
}

export default CSSModules(DialogueOrientation, styles, {allowMultiple:true});