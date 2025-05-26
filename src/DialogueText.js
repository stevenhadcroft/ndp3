import { Fragment, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import CSSModules from 'react-css-modules';
import styles from './styles/';
import { Constants } from "./constants";

import { 
    updateTextData, 
    setGeneric
} from "./actions";

import { 
    setMode, 
    cancelMode,
    showPhonetics,
    addPhonetic,
} from "./features/viewSlice";

import DraggablePanel from "./DraggablePanel";

const fontList = Constants.FONTLIST; //["Monospace", "Verdana", "Impact"]; 

const DialogueText = () => {
    
    // HOOKS ---------------------------------------------------
    const dispatch = useDispatch();
    const view = useSelector(state => state.view);
    const canvas = useSelector(state => state.canvas);
    
    useEffect(()=>{
        dispatch(setGeneric({key:"textfieldFocussed", value:false})); // reset allow key nudge
    }, [])

    // if phonetic changes then add
    useEffect(()=>{
        if (!view.phoneticToAdd) return;
        const newText = currentText.text + view.phoneticToAdd;
        dispatch(updateTextData('text', newText));
        dispatch(addPhonetic(null)); // clear out
    }, [view.phoneticToAdd])

    const currentText = canvas.texts[canvas.selectedIndex] || {};

    //--------------------------------------------------------------
	// Handlers
	//--------------------------------------------------------------
    const onChooseFont = evt => {
		dispatch(updateTextData('fontFamily', evt.target.value))
	};

    const onShowPhonetic = evt => {
		dispatch(showPhonetics(true))
	};

    const onFocus = evt => {
        const str = evt.currentTarget.value;
        if (str === 'Enter text'){
            dispatch(updateTextData('text', ''));
        }
		dispatch(setGeneric({key:"textfieldFocussed", value:true}))
    }; 
    
    const onBlur = evt => {
    	dispatch(setGeneric({key:"textfieldFocussed", value:false}))
    };

    const onChange = evt => {
		dispatch(updateTextData('text', evt.currentTarget.value));
	};

    //--------------------------------------------------------------
	// Buttons Component
	//--------------------------------------------------------------
    const Buttons = (
        <Fragment>
            <button styleName="primary narrow blue" onClick={()=>dispatch(cancelMode())}>Done</button>
        </Fragment>
    )


    const JustifyButton = ({justify}) => {
        return (
                <button styleName="icon" style={{width:"40px", height:"40px"}} onClick={() => dispatch(updateTextData('justify', justify))}>
                    <img src={`./imgs/gui/justify-${justify}.svg`} alt=""
                        style={{
                            marginTop: "5px",
                            transform: "scale(1, 1.5)",
                            filter: `brightness(0.5) invert(${currentText.justify === justify ? 1 : 0.7})`
                        }}
                        />
                </button>
        )
    }

    //--------------------------------------------------------------
    // Main
	//--------------------------------------------------------------
	return (
		<DraggablePanel id='dialogue-add-text' title='Edit Text' buttons={Buttons}>
            <div>
                <div style={{display:"flex"}}>
                    <select onChange={onChooseFont} styleName="with-phonetic">
                        {/* <option>Choose Font</option> */}
                        {fontList.map(fontName => <option selected={fontName === currentText.fontFamily}>{fontName}</option>)}
                    </select>

                    <button styleName="add-phonetic large" onClick={onShowPhonetic} />

                    <div style={{marginLeft:"12px"}}>
                        <JustifyButton justify="left"/>
                        <JustifyButton justify="center"/>
                        <JustifyButton justify="right"/>
                    </div>
                </div>
                    
                <div style={{display:"flex", margin:"20px 0 10px 0"}}>
                    <span style={{flex:"2", marginRight:"5px"}}>
                        <input type="range" value={currentText.fontSize} onChange={evt=>dispatch(updateTextData('fontSize', evt.target.value))}/>
                    </span>
                    <button styleName="icon" onClick={()=>dispatch(updateTextData('bold', !currentText.bold))}>
                        <span style={{fontSize:"30px", fontWeight:"bold", color:currentText.bold ? "#fff" : "#999"}}>B</span>
                    </button>
                    <button styleName="icon" onClick={()=>dispatch(updateTextData('italic', !currentText.italic))}>
                        <span style={{fontSize:"30px", fontWeight:"bold", fontStyle:"italic", color:currentText.italic ? "#fff" : "#999"}}>I</span>
                    </button>
                    <button styleName="icon" onClick={()=>dispatch(setMode(Constants.MODE_COLOUR_TEXT))}>
                        <img src="./imgs/gui/Bitmap_1.png" alt=""/>
                    </button>
                </div>
                
                
                {/* <select className="" onChange={evt=>dispatch(updateTextData('fontSize', evt.target.value))}>
                    <option value={20}>20</option>
                    <option value={24}>24</option>
                    <option value={28}>28</option>
                </select> */}
                {/* </div> */}

                <textarea   id="filename-input" 
                            rows="4"
                            value={currentText.text}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            onChange={onChange}
                />

            </div>
            
		</DraggablePanel>
	);
}

export default CSSModules(DialogueText, styles, {allowMultiple:true});


