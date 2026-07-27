import { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { cx } from '../styles';
import { getHighestZdepth } from "../utils";

import {
	Constants,
	eSearchLogic,
	eSearchFilter
} from "../constants";

import {
	// setGeneric,
	cancelMode,
	setSearch,
	showPhonetics,
	addPhonetic,
	showLoader,
} from "../features/viewSlice";

import {
	addImage,
	updateImageData,
} from "../features/canvasSlice";

import { loadImage } from "../loaders";
import DraggablePanel from "./DraggablePanel";

export const Spinner = () => {
	return (
		<div style={{ zIndex: 999999, position: "absolute", marginLeft: "30px", marginTop: "-120px", XXopacity: 0.5 }}>
			<img src="./imgs/spinner.svg" width="80px" height="80px" />
		</div>
	);
};

//--------------------------------------------------------------
// Search Component
//--------------------------------------------------------------
let Search = () => {
	const dispatch = useDispatch();
	const view = useSelector(state => state.view);
	const [searchInput, setSearchInput] = useState(view.searchTerm || '');
	const [searchLogic, setSearchLogic] = useState(view.searchLogic);

	useEffect(() => {
		dispatch(setSearch({ term: null }))
	}, []);

	// if phonetic changes then add
	useEffect(() => {
		if (view.phoneticToAdd) {
			setSearchInput(searchInput + view.phoneticToAdd);
			dispatch(addPhonetic(null)); // clear out
		}
	}, [view.phoneticToAdd])

	// HANDLERS ---------------------------------------------------
	const onSearchInput = (evt) => setSearchInput(evt.target.value);
	const onShowPhonetic = () => dispatch(showPhonetics(true));
	const onBegins = () => setSearchLogic(eSearchLogic.BEGINS);
	const onContains = () => setSearchLogic(eSearchLogic.CONTAINS);
	const onFilter = (filter) => dispatch(setSearch({ filter }));
	const onSearch = () => dispatch(setSearch({ term: searchInput, logic: searchLogic }));
	// const onBegins = () => dispatch(setSearch({logic:eSearchLogic.BEGINS}));
	// const onContains = () => dispatch(setSearch({logic:eSearchLogic.CONTAINS}));

	return (
		<div className={cx("search-bar margin-bb")}>
			<span style={{ display: "inline-block", marginBottom: '10px', marginRight: '50px' }}>
				<span className={cx("margin-r")}>Search</span>
				<button className={cx(`filter ${view.searchFilter === eSearchFilter.PICTURE ? "active" : ""}`)} onClick={() => onFilter(eSearchFilter.PICTURE)}>Pictures</button>
				<button className={cx(`filter ${view.searchFilter === eSearchFilter.SOUND ? "active" : ""}`)} onClick={() => onFilter(eSearchFilter.SOUND)}>Letter sounds</button>
				<button className={cx(`filter ${view.searchFilter === eSearchFilter.PHONETIC ? "active" : ""}`)} onClick={() => onFilter(eSearchFilter.PHONETIC)}>Phonetics</button>
			</span>

			<span style={{ display: "inline-block" }}>
				<span className={cx("search-setting")}>
					<button className={cx(searchLogic === eSearchLogic.BEGINS ? "selected" : "")} onClick={onBegins}>Begins</button>
					<span style={{ margin: "0 -3px" }}>/</span>
					<button className={cx(searchLogic === eSearchLogic.CONTAINS ? "selected" : "")} onClick={onContains}>Contains</button>
				</span>
				<input type="text" placeholder="type text" className={cx("with-phonetic")} value={searchInput} onChange={onSearchInput} />
				<button className={cx("add-phonetic")} style={{ top: "3px" }} onClick={onShowPhonetic} />
				<button className={cx("search")} onClick={onSearch}>Search</button>
			</span>
		</div>
	)
}


//--------------------------------------------------------------
// Category Chooser Component
//--------------------------------------------------------------
let CategoryChooser = () => {
	const dispatch = useDispatch();
	const view = useSelector(state => state.view);

	// HANDLERS ---------------------------------------------------
	const onChooseCategory = evt => {
		const category = Constants.IMAGE_CATEGORIES[evt.target.selectedIndex].id;
		dispatch(setSearch({ category }));
	};

	return (
		<div className={cx("margin-b margin-ll")}>
			<span className={cx("margin-r")}>Show</span>
			<select onChange={onChooseCategory}>
				{Constants.IMAGE_CATEGORIES.map((category, index) => {
					const selected = view.searchCategory === Constants.IMAGE_CATEGORIES[index].title;
					return <option key={index} selected={selected ? "selected" : null}>{category.title}</option>
				})}
			</select>
		</div>
	)
}


//--------------------------------------------------------------
// Image List
//--------------------------------------------------------------
let localSelectedIndex;

let ImageList = () => {
	const view = useSelector(state => state.view);
	const [selectedIndex, setSelectedIndex] = useState();
	const [loaded, setLoaded] = useState([]);
	
	const onImageClicked = (evt) => {
		setSelectedIndex(Math.floor(evt.target.dataset.index));
		localSelectedIndex = Math.floor(evt.target.dataset.imagelibraryindex);
	}

	return (
		view.imageLibrary || []).map((item, index) => (
			<div>
				<img key={index}
					className={cx(`cell ${index === selectedIndex ? 'selected' : ''}`)}
					src={item.url}
					data-index={index}
					data-imagelibraryindex={item.imageLibraryIndex}
					onClick={onImageClicked}
					onLoad={() => {
						let v = [...loaded];
						v[index] = true;
						setLoaded(v);
					}}
					/>
				{/* {!loaded[index] && <Spinner />} */}
				<div className={cx("cell-label")}>{item.viewTitle}</div>
			</div>
			// </LazyLoad>
		)
		)
}


//--------------------------------------------------------------
// MAIN
//--------------------------------------------------------------
const DialogueAddImage = () => {
	// HOOKS ---------------------------------------------------
	const dispatch = useDispatch();
	const canvas = useSelector(state => state.canvas);
	const [error, setError] = useState("");

	// HANDLERS ---------------------------------------------------
	const onLoadClicked = (ind) => {
		if (ind === undefined || ind === null || !window.IMAGE_FILES[ind]) {
			setError("Please select an image first.");
			return;
		}
		setError("");
		dispatch(showLoader(true));
		const url = window.IMAGE_FILES[ind].url;
		const filename = window.IMAGE_FILES[ind].filename;
		const images = canvas.images || [];
		const zIndex = images.length > 0 ? getHighestZdepth(images) : 1;

		// Calculate center position based on canvas orientation
		const orientation = canvas.orientation || "portrait";
		const centerX = orientation === "portrait" ? 384 : 550;
		const centerY = orientation === "portrait" ? 550 : 384;

		const newImage = { type: "image", x: centerX, y: centerY, angle: 0, size: 300, url, zIndex };
		const index = images.length; // index of new image
		dispatch(addImage(newImage));
		loadImage(url, images.length, (key, svg) => {
			// add id to SVG so it can xreffed for stored colour later
			svg = svg.replace('<svg ', `<svg filename="${filename}" `);
			dispatch(updateImageData({ index, key, value: svg }));
			dispatch(showLoader(false));
		});
		dispatch(cancelMode());
	};

	//--------------------------------------------------------------
	// Buttons Component
	//--------------------------------------------------------------
	const Buttons = (
		<>
			<button className={cx("secondary narrow")} onClick={() => dispatch(cancelMode())}>Cancel</button>
			<button className={cx("primary narrow")} onClick={() => onLoadClicked(localSelectedIndex)}>Use selected</button>
		</>
	)

	//--------------------------------------------------------------
	// Main
	//--------------------------------------------------------------
	return (
		<DraggablePanel id="add-image" title="Add Image" type="fullscreen" buttons={Buttons}>
			<CategoryChooser />
			<Search />
			{error &&
				<div style={{ color: "#ff5252", fontWeight: 600, padding: "0 20px 10px" }}>{error}</div>
			}
			<div className={cx("dialogue-inner")}>
				<ImageList />
			</div>
		</DraggablePanel>
	);
}

export default DialogueAddImage;