import { useDispatch } from 'react-redux'
import useDefaultTemplate from "../hooks/useDefaultTemplate";

import { 
	cancelMode
} from "../features/viewSlice";

import { 
	resetCanvas,
    setOrientation
} from "../features/canvasSlice";

import DraggablePanel from "./DraggablePanel";

const DialogueOrientation = () => {

    // HOOKS ---------------------------------------------------
    const dispatch = useDispatch();
    const loadDefaultTemplate = useDefaultTemplate();

    // HANDLERS ---------------------------------------------------
    const onNewProject = (orientation) => {
        // window.orientation = orientation; // TODO IMPROVE
        dispatch(cancelMode());
        dispatch(resetCanvas());
        dispatch(setOrientation(orientation));
        loadDefaultTemplate();
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

export default DialogueOrientation;