import { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { cx } from '../styles';
import { eMode, FONTLIST } from "../constants";

// import { 
//     setGeneric
// } from "../actions";

import { 
    setMode, 
    cancelMode,
    showPhonetics,
    addPhonetic,
} from "../features/viewSlice";

import { 
    updateTextData
 } from "../features/canvasSlice";

import DraggablePanel from "./DraggablePanel";

const DialogueText = () => {
    
    // HOOKS ---------------------------------------------------
    const dispatch = useDispatch();
    const view = useSelector(state => state.view);
    const canvas = useSelector(state => state.canvas);
    
    // useEffect(()=>{
    //     dispatch(setGeneric({key:"textfieldFocussed", value:false})); // reset allow key nudge
    // }, [])

    // if phonetic changes then add
    useEffect(()=>{
        if (!view.phoneticToAdd) return;
        const newText = currentText.text + view.phoneticToAdd;
        dispatch(updateTextData({key:'text', value:newText}));
        dispatch(addPhonetic(null)); // clear out
    }, [view.phoneticToAdd])

    const currentText = canvas.texts[canvas.selectedIndex] || {};

    //--------------------------------------------------------------
	// Handlers
	//--------------------------------------------------------------
    const onChooseFont = evt => {
		dispatch(updateTextData({key:'fontFamily', value:evt.target.value}))
    };

    const onShowPhonetic = evt => {
		dispatch(showPhonetics(true))
	};

    const onFocus = evt => {
        const str = evt.currentTarget.value;
        if (str === 'Enter text'){
            dispatch(updateTextData({key:'text', value:''}))
        }
		// dispatch(setGeneric({key:"textfieldFocussed", value:true}))
    }; 
    
    const onBlur = evt => {
    	// dispatch(setGeneric({key:"textfieldFocussed", value:false}))
    };

    const onChange = evt => {
        dispatch(updateTextData({key:'text', value:evt.currentTarget.value}))
	};

    //--------------------------------------------------------------
	// Buttons Component
	//--------------------------------------------------------------
    const Buttons = (
        <>
            <button className={cx("primary narrow")} onClick={()=>dispatch(cancelMode())}>Done</button>
        </>
    )


    const JustifyButton = ({justify}) => {
        const isSelected = currentText.justify === justify;
        return (
                <button className={cx("icon")} onClick={() => dispatch(updateTextData({key:'justify', value:justify}))}>
                    <img src={`./imgs/gui/justify-${justify}.svg`} alt=""
                        className={cx(`text-justify-icon ${isSelected ? "selected" : ""}`)}
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
                <div className={cx("text-row")}>
                    <select onChange={onChooseFont} value={currentText.fontFamily || ""} className={cx("with-phonetic")}>
                        {FONTLIST.map(fontName => <option key={fontName} value={fontName}>{fontName}</option>)}
                    </select>

                    <button className={cx("add-phonetic large")} onClick={onShowPhonetic} />

                    <div className={cx("text-justify-group")}>
                        <JustifyButton justify="left"/>
                        <JustifyButton justify="center"/>
                        <JustifyButton justify="right"/>
                    </div>
                </div>

                <div className={cx("text-row spaced")}>
                    <span className={cx("text-range-wrapper")}>
                        <input type="range" value={currentText.fontSize} onChange={evt=>dispatch(updateTextData({key:'fontSize', value:evt.target.value}))}/>
                    </span>
                    <button className={cx("icon")} onClick={()=>dispatch(updateTextData({key:'bold', value:!currentText.bold}))}>
                        <span className={cx(`text-style-glyph ${currentText.bold ? "active" : ""}`)}>B</span>
                    </button>
                    <button className={cx("icon")} onClick={()=>dispatch(updateTextData({key:'italic', value:!currentText.italic}))}>
                        <span className={cx(`text-style-glyph italic ${currentText.italic ? "active" : ""}`)}>I</span>
                    </button>
                    <button className={cx("icon")} onClick={()=>dispatch(setMode(eMode.COLOUR_TEXT))}>
                        <img src="./imgs/gui/Bitmap_1.png" alt=""/>
                    </button>
                </div>

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

export default DialogueText;


