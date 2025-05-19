import { useDispatch } from 'react-redux'
import { Constants } from "./constants";
import CSSModules from 'react-css-modules';
import styles from './styles/';
import { cancelMode, newProject, setMode, setOrientation } from './actions'
import DraggablePanel from "./DraggablePanel";


const DialogueConfirmNew = () => {

    // HOOKS ---------------------------------------------------
    const dispatch = useDispatch();

    // HANDLERS ---------------------------------------------------
    const onClose = () => {
        dispatch(cancelMode());
    }

    const onSave = () => {
        dispatch(setMode(Constants.MODE_SAVE_BEFORE_NEW));
    }
    
    const onDontSave = () => {
        // dispatch(newProject());
        dispatch(setMode(Constants.MODE_SET_ORIENTATION));
    }
    
    //--------------------------------------------------------------
	// Main
	//--------------------------------------------------------------
    return (
        <DraggablePanel type="modal">
            <div style={{marginBottom:"20px"}}>Do you want to save the current project?</div>
            <div styleName="dialogue-inner no-scroll" >
                <button styleName="primary narrow blue" onClick={onClose}>Cancel</button>
                <button styleName="primary narrow orange" onClick={onDontSave}>Don't Save</button>
                <button styleName="primary narrow green" onClick={onSave}>Save</button>
            </div>
        </DraggablePanel>
	);
}

export default CSSModules(DialogueConfirmNew, styles, {allowMultiple:true});