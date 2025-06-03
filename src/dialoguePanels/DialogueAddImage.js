import { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux'
import CSSModules from 'react-css-modules';
import styles from '../styles';

import { 
	Constants, 
	eSearchLogic, 
	eSearchFilter
} from "../constants";

import { 
	cancelMode,
	setSearch,
	showPhonetics, 
	addPhonetic,
} from "../features/viewSlice";

import { 
	addImage, 
	updateImageData, 
} from "../features/canvasSlice";

import { loadImage } from "../loaders";
import DraggablePanel from "./DraggablePanel";

// import LazyLoad from 'react-lazyload';
// const LazyLoad = ({children}) => {
// 	<>{children}</>
// }

//--------------------------------------------------------------
// Search Component
//--------------------------------------------------------------
let Search = () => {
	const dispatch = useDispatch();
	const view = useSelector(state => state.view);
	const [searchInput, setSearchInput] = useState(view.searchTerm || '');
	const [searchLogic, setSearchLogic] = useState(view.searchLogic);

	useEffect(()=>{
		dispatch(setSearch({term:null}))
	}, []);
	
	// if phonetic changes then add
	useEffect(()=>{
		// if (!view.phoneticToAdd) return; 
		if (view.phoneticToAdd){
			setSearchInput(searchInput + view.phoneticToAdd);
			dispatch(addPhonetic(null)); // clear out
		}
	}, [view.phoneticToAdd])
	
	// HANDLERS ---------------------------------------------------
	const onSearchInput = (evt) => setSearchInput(evt.target.value);
	const onShowPhonetic = () => dispatch(showPhonetics(true));
	const onBegins = () => setSearchLogic(eSearchLogic.BEGINS);
	const onContains = () => setSearchLogic(eSearchLogic.CONTAINS);
	const onFilter = (filter) => dispatch(setSearch({filter}));
	const onSearch = () => dispatch(setSearch({term:searchInput, logic:searchLogic}));
	// const onBegins = () => dispatch(setSearch({logic:eSearchLogic.BEGINS}));
	// const onContains = () => dispatch(setSearch({logic:eSearchLogic.CONTAINS}));
	
	return (
		<div className="search-bar" styleName="margin-bb margin-ll">
			<span style={{display:"inline-block", marginBottom:'10px', marginRight:'50px'}}>
				<span styleName="margin-r">Search</span>
				<button styleName={`filter ${view.searchFilter === eSearchFilter.PICTURE ? "active" : ""}`} onClick={()=>onFilter(eSearchFilter.PICTURE)}>Pictures</button>
				<button styleName={`filter ${view.searchFilter === eSearchFilter.SOUND ? "active" : ""}`} onClick={()=>onFilter(eSearchFilter.SOUND)}>Letter sounds</button>
				<button styleName={`filter ${view.searchFilter === eSearchFilter.PHONETIC ? "active" : ""}`} onClick={()=>onFilter(eSearchFilter.PHONETIC)}>Phonetics</button>
			</span>
			
			<span style={{display:"inline-block"}}>
				<span styleName="search-setting">
					<button styleName={searchLogic === eSearchLogic.BEGINS ? "selected" : ""} onClick={onBegins}>Begins</button>
					<span style={{margin:"0 -3px"}}>/</span>
					<button styleName={searchLogic === eSearchLogic.CONTAINS ? "selected" : ""} onClick={onContains}>Contains</button>
				</span>
				<input type="text" placeholder="type text" styleName="with-phonetic" value={searchInput} onChange={onSearchInput}/>
				<button styleName="add-phonetic" style={{top:"3px"}} onClick={onShowPhonetic} />
				<button styleName="search" onClick={onSearch}>Search</button>
			</span>
		</div>
	)
}
Search = CSSModules(Search, styles, {allowMultiple:true});


//--------------------------------------------------------------
// Category Chooser Component
//--------------------------------------------------------------
let CategoryChooser = () => {
	const dispatch = useDispatch();
	const view = useSelector(state => state.view);

	// HANDLERS ---------------------------------------------------
	const onChooseCategory = evt => {
		const category = Constants.IMAGE_CATEGORIES[evt.target.selectedIndex].id;
		dispatch(setSearch({category}));
	};

	return (
		<div styleName="margin-b margin-ll">
			<span styleName="margin-r">Show</span>
			<select onChange={onChooseCategory}>
				{Constants.IMAGE_CATEGORIES.map((category, index) => {
					const selected = view.searchCategory === Constants.IMAGE_CATEGORIES[index].title;
					return <option key={index} selected={selected ? "selected" : null}>{category.title}</option>
				})}
			</select>
		</div>
	)
}
CategoryChooser = CSSModules(CategoryChooser, styles, {allowMultiple:true});


//--------------------------------------------------------------
// Image List
//--------------------------------------------------------------
let localSelectedIndex;

let ImageList = () => {
	const view = useSelector(state => state.view);
	const [selectedIndex, setSelectedIndex] = useState();

	const onImageClicked = (evt) => {
		setSelectedIndex(Math.floor(evt.target.dataset.index));
		localSelectedIndex = Math.floor(evt.target.dataset.imagelibraryindex);
	}

	return (
		view.imageLibrary || []).map((item, index) => (
			// <LazyLoad height={Constants.POT_SIZE} once>
			// </LazyLoad>
			<div>
				<img 	key={index} 
						styleName={`cell ${index === selectedIndex ? 'selected' : ''}`}
						// style={{marginBottom:"10px"}}
						src={item.url} 
						data-index={index}
						data-imagelibraryindex={item.imageLibraryIndex}
						onClick={onImageClicked}/>
				<div styleName="cell-label">{item.viewTitle}</div>
			</div>
		)
	)
}
ImageList = CSSModules(ImageList, styles, {allowMultiple:true});


//--------------------------------------------------------------
// MAIN
//--------------------------------------------------------------
const DialogueAddImage = () => {
	// HOOKS ---------------------------------------------------
	const dispatch = useDispatch();
	const canvas = useSelector(state => state.canvas);

	// HANDLERS ---------------------------------------------------
	const onLoadClicked = (ind) => {
		const url = window.IMAGE_FILES[ind].url;
        const filename = window.IMAGE_FILES[ind].filename;
        const images = canvas.images || [];
		const zIndex = images.length>0 ? Math.max.apply(Math, images.map(function(o) { return o.zIndex; })) + 1 : 1; // get highest zindex + 1 
		const newImage = { type:"image", x: 250, y: 250, angle: 0, size: 300, url, zIndex};
		const index = images.length; // index of new image
		dispatch(addImage(newImage));
		loadImage(url, images.length, (key, svg) => {
			console.log("callback1 ", filename);
			// add id to SVG so it can xreffed for stored colour later
			svg = svg.replace('<svg ', `<svg filename="${filename}" `);
			dispatch(updateImageData({index, key, value:svg}));
		});
		dispatch(cancelMode());
	};

	//--------------------------------------------------------------
	// Buttons Component
	//--------------------------------------------------------------
	const Buttons = (
        <>
            <button styleName="primary narrow blue" onClick={()=>dispatch(cancelMode())}>Back to main</button>
            <button styleName="primary narrow green" onClick={()=>onLoadClicked(localSelectedIndex)}>Use selected</button>
        </>
    )

	//--------------------------------------------------------------
	// Main
	//--------------------------------------------------------------
	return (
		<DraggablePanel id="add-image" title="Add Image" type="fullscreen" buttons={Buttons}>
			<CategoryChooser />
			<Search />
			<div styleName="dialogue-inner" style={{height:"calc(100% - 205px)"}}>
				<ImageList />
			</div>
		</DraggablePanel>
	);
}

export default CSSModules(DialogueAddImage, styles, {allowMultiple:true});