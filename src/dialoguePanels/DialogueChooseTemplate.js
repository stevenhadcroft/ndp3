import { useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { cx } from '../styles';
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

const DialogueChooseTemplate = () => {
    
    // HOOKS ---------------------------------------------------
    const dispatch = useDispatch();
    const view = useSelector(state => state.view);
    const [selectedIndex, setSelectedIndex] = useState();
    const [error, setError] = useState("");


    // HANDLERS ---------------------------------------------------
    const onChooseTemplate = (index) => {
        if (index === undefined || index === null || !window.WORKSHEET_FILES[index]) {
            setError("Please select a template first.");
            return;
        }
        setError("");
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
	const Search = () => (
        <div className={cx("margin-bb")}>
            <span className={cx("margin-r")}>Show</span>
            {Constants.WORKSHEET_CATEGORIES.map(category => {
                const _stylename = `filter ${(!view.templateFilters && category.title === "All") || (view.templateFilters && view.templateFilters[category.title]) ? "active" : ""}`;
                return <button className={cx(_stylename)} onClick={()=>onFilterClicked(category.title)}>{category.title}</button>
            })}
        </div>
    )

    //--------------------------------------------------------------
	// Image List
	//--------------------------------------------------------------
	const ImageList = () => (
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
                                        className={cx(`cell tall ${index === selectedIndex ? 'selected' : ''}`)}
                                        src={item.url}
                                        onClick={e => setSelectedIndex(index)}
                                />
                                <div className={cx("cell-label")}>{item.itemRoot.getAttribute("Wtitle")}</div>
                        </div>
                    )
                } else {
                    return null;
                }
            })}
        </>
    )


    //--------------------------------------------------------------
	// Buttons Component
	//--------------------------------------------------------------
    const Buttons = (
        <>
            <button className={cx("secondary narrow")} onClick={()=>dispatch(cancelMode())}>Cancel</button>
            <button className={cx("primary narrow")} onClick={()=>onChooseTemplate(selectedIndex)}>Use selected</button>
        </>
    )

    //--------------------------------------------------------------
	// Main
	//--------------------------------------------------------------
	return (
		<DraggablePanel id='choose-template' title="Choose Template" type="fullscreen" buttons={Buttons}>
            <Search/>
            {error &&
                <div style={{ color: "#ff5252", fontWeight: 600, padding: "0 20px 10px" }}>{error}</div>
            }
            <div className={cx("dialogue-inner")}>
                <ImageList/>
            </div>
		</DraggablePanel>
	);
}

export default DialogueChooseTemplate;


