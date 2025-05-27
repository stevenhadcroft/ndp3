import { useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import CSSModules from 'react-css-modules';
import styles from '../styles';
import { Constants } from "../constants";

import { 
    setTemplateData, 
    updateTemplateData, 
} from "../features/canvasSlice";

import { 
    cancelMode,
    applyTemplateFilter
} from "../features/viewSlice";

import { loadTemplate } from "../loaders";
import DraggablePanel from "./DraggablePanel";

// import LazyLoad from 'react-lazyload';

// const LazyLoad = ({children}) => {
// 	<>{children}</>
// }

const DialogueChooseTemplate = () => {
    
    // HOOKS ---------------------------------------------------
    const dispatch = useDispatch();
    const view = useSelector(state => state.view);
    const [selectedIndex, setSelectedIndex] = useState();
	

    // HANDLERS ---------------------------------------------------
    const onChooseTemplate = (index) => {
        const url = window.WORKSHEET_FILES[index].url;
		const newTemplate = { type:"image", size: 300, url};
		dispatch(setTemplateData(newTemplate));
		dispatch(cancelMode());
        loadTemplate(url, view.templateData || {}, 
            str => {
                dispatch(updateTemplateData({key:"svg", value:str}))
            }
        );
	};

    const onFilterClicked = category => {
        dispatch(applyTemplateFilter(category));
	};
 
    //--------------------------------------------------------------
	// Search
	//--------------------------------------------------------------
	let Search = () => (
        <div styleName="margin-bb margin-ll">
            <span styleName="margin-r">Show</span>
            {Constants.WORKSHEET_CATEGORIES.map(category => {
                const _stylename = `filter ${(!view.templateFilters && category.title === "All") || (view.templateFilters && view.templateFilters[category.title]) ? "active" : ""}`;
                return <button styleName={_stylename} onClick={()=>onFilterClicked(category.title)}>{category.title}</button>
            })}
        </div>
    )
    Search = CSSModules(Search, styles, {allowMultiple:true});

    //--------------------------------------------------------------
	// Image List
	//--------------------------------------------------------------
	let ImageList = () => (
        <>
            {window.WORKSHEET_FILES.map((item, index) => {
                //filter
                let show = true;                    
                if (view.templateFilters && !view.templateFilters["All"]){ // a filter is active?
                    for (let filter in view.templateFilters){
                        const filterId = Constants.WORKSHEET_CATEGORIES.find(item => item.title === filter).id;
                        show = item.itemRoot.getAttribute(filterId).toLowerCase() === "true" ? true : false;
                    }
                }

                if (show){
                    return (
                        <div key={index} >
                            {/* <LazyLoad height={Constants.POT_SIZE} once> */}
                            {/* </LazyLoad> */}
                                <img   key={index} 
                                        styleName={`cell tall ${index === selectedIndex ? 'selected' : ''}`}
                                        src={item.url} 
                                        onClick={e => setSelectedIndex(index)}
                                />
                                <div styleName="cell-label">{item.itemRoot.getAttribute("Wtitle")}</div>
                        </div>
                    )
                } else {
                    return null;
                }
            })}
        </>
    )
    ImageList = CSSModules(ImageList, styles, {allowMultiple:true});


    //--------------------------------------------------------------
	// Buttons Component
	//--------------------------------------------------------------
    const Buttons = (
        <>
            <button styleName="primary narrow blue" onClick={()=>dispatch(cancelMode())}>Back to main</button>
            <button styleName="primary narrow green" onClick={()=>onChooseTemplate(selectedIndex)}>Use selected</button>
        </>
    )

    //--------------------------------------------------------------
	// Main
	//--------------------------------------------------------------
	return (
		<DraggablePanel id='choose-template' title="Choose Template" type="fullscreen" buttons={Buttons}>
            <Search/>
            <div styleName="dialogue-inner" style={{height:"calc(100% - 142px)"}}>
                <ImageList/>
            </div>
		</DraggablePanel>
	);
}

export default CSSModules(DialogueChooseTemplate, styles, {allowMultiple:true});


