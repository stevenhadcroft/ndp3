import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { cx } from '../styles';
import { getHighestZdepth } from "../utils";

import {
	Constants,
	eSearchLogic,
	eSearchFilter,
	MY_IMAGES_CATEGORY_ID
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
import { getCurrentUser } from "../services/localLicenseMananger";
import DraggablePanel from "./DraggablePanel";

const isElectron = !!window.electronAPI;

// Dev-only preview of the "My Images" upload flow, for when the app isn't
// running inside Electron (e.g. `npm start`) — files are picked with a real
// <input type="file"> and held in memory only, nothing touches disk.
// `npm run build` always sets NODE_ENV=production (that's what Electron
// ships), so this never reaches a real build regardless of how it's run.
const DEBUG_MY_IMAGES = process.env.NODE_ENV !== "production" && !isElectron;

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
			<span style={{ display: "inline-block", marginBottom: '5px', marginRight: '50px' }}>
				<span className={cx("margin-r")}>Filter</span>
				<button className={cx(`filter ${view.searchFilter === eSearchFilter.PICTURE ? "filter-active" : ""}`)} onClick={() => onFilter(eSearchFilter.PICTURE)}>Pictures</button>
				<button className={cx(`filter ${view.searchFilter === eSearchFilter.SOUND ? "filter-active" : ""}`)} onClick={() => onFilter(eSearchFilter.SOUND)}>Letter sounds</button>
				<button className={cx(`filter ${view.searchFilter === eSearchFilter.PHONETIC ? "filter-active" : ""}`)} onClick={() => onFilter(eSearchFilter.PHONETIC)}>Phonetics</button>
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
let CategoryChooser = ({ children }) => {
	const dispatch = useDispatch();
	const view = useSelector(state => state.view);

	const isMyImages = view.searchCategory === MY_IMAGES_CATEGORY_ID;

	// HANDLERS ---------------------------------------------------
	const onChooseCategory = evt => {
		dispatch(setSearch({ category: evt.target.value }));
	};

	const onGoToMyImages = () => dispatch(setSearch({ category: MY_IMAGES_CATEGORY_ID }));
	const onGoToAllImages = () => dispatch(setSearch({ category: Constants.IMAGE_CATEGORIES[0].id }));

	return (
		<div className={cx("margin-b margin-ll")}>
			<span className={cx("margin-r")}>Show</span>
			<select value={view.searchCategory || Constants.IMAGE_CATEGORIES[0].id} onChange={onChooseCategory}>
				{Constants.IMAGE_CATEGORIES.map((category) => (
					<option key={category.id} value={category.id}>{category.title}</option>
				))}
			</select>
			{!isMyImages && (
				<button className={cx("secondary narrow")} style={{ marginLeft: "20px", width: "auto", padding: "0 20px", whiteSpace: "nowrap" }} onClick={onGoToMyImages}>
					View My Images
				</button>
			)}
			{isMyImages && (
				<button className={cx("secondary narrow")} style={{ marginLeft: "20px", width: "auto", padding: "0 20px", whiteSpace: "nowrap" }} onClick={onGoToAllImages}>
					View all images
				</button>
			)}
			<div style={{ marginTop: "10px", marginBottom: "10px" }}>
				{children}
			</div>
		</div>
	)
}


//--------------------------------------------------------------
// Image List
//--------------------------------------------------------------
let localSelectedIndex;

// Memoized so selecting one image (a state change in the parent) doesn't
// re-render and re-diff every other cell — there can be ~700+ of these.
const ImageCell = memo(function ImageCell({ item, index, isSelected, onClick }) {
	return (
		<div>
			<img
				className={cx(`cell ${isSelected ? 'selected' : ''}`)}
				src={item.url}
				data-index={index}
				data-imagelibraryindex={item.imageLibraryIndex}
				onClick={onClick}
				/>
			<div className={cx("cell-label")}>{item.viewTitle}</div>
		</div>
	);
});

let ImageList = () => {
	const view = useSelector(state => state.view);
	const [selectedIndex, setSelectedIndex] = useState();

	const onImageClicked = useCallback((evt) => {
		setSelectedIndex(Math.floor(evt.target.dataset.index));
		localSelectedIndex = Math.floor(evt.target.dataset.imagelibraryindex);
	}, []);

	return (
		view.imageLibrary || []).map((item, index) => (
			<ImageCell
				key={index}
				item={item}
				index={index}
				isSelected={index === selectedIndex}
				onClick={onImageClicked}
			/>
		)
		)
}


//--------------------------------------------------------------
// My Images (user-uploaded, raster) List
//--------------------------------------------------------------
// Debug-only in-memory store, so uploads survive re-opening the dialogue
// within the same session (mirrors what the real filesystem store would do).
let debugImages = [];

let MyImagesList = ({ images, selectedFilename, onPick, onRemove }) => {
	return (
		<>
			{images.map((item) => (
				<div key={item.filename} style={{ position: "relative", display: "inline-block" }}>
					<img
						className={cx(`cell ${item.filename === selectedFilename ? 'selected' : ''}`)}
						style={{ objectFit: "contain" }}
						src={item.url}
						onClick={() => onPick(item)}
					/>
					<button
						type="button"
						onClick={(evt) => onRemove(evt, item.filename)}
						title="Remove image"
						style={{
							position: "absolute", top: "0px", right: "0px",
							width: "30px", height: "30px", borderRadius: "50%",
							border: "none", background: "var(--color-overlay-dark)", color: "#fff",
							cursor: "pointer", lineHeight: "28px", fontSize: "20px", padding: 0,
						}}
					>×</button>
				</div>
			))}
			{images.length === 0 &&
				<div style={{ padding: "20px" }}>No images added yet.</div>
			}
		</>
	);
}


//--------------------------------------------------------------
// MAIN
//--------------------------------------------------------------
const DialogueAddImage = () => {
	// HOOKS ---------------------------------------------------
	const dispatch = useDispatch();
	const view = useSelector(state => state.view);
	const canvas = useSelector(state => state.canvas);
	const [error, setError] = useState("");

	const [myImages, setMyImages] = useState(DEBUG_MY_IMAGES ? debugImages : []);
	const [selectedMyImage, setSelectedMyImage] = useState(null);
	const [addingMyImage, setAddingMyImage] = useState(false);
	const fileInputRef = useRef(null);

	const inMyImages = view.searchCategory === MY_IMAGES_CATEGORY_ID;

	// HANDLERS ---------------------------------------------------
	const refreshMyImages = () => {
		if (DEBUG_MY_IMAGES) {
			setMyImages([...debugImages]);
			return;
		}
		if (!isElectron) return;
		window.electronAPI.listMyImages(getCurrentUser()).then(res => {
			if (res?.success) setMyImages(res.images);
		});
	};

	useEffect(() => {
		if (inMyImages) refreshMyImages();
	}, [inMyImages]);

	const onAddMyImage = () => {
		if (DEBUG_MY_IMAGES) {
			fileInputRef.current?.click();
			return;
		}
		setAddingMyImage(true);
		window.electronAPI.addMyImages(getCurrentUser())
			.then(refreshMyImages)
			.finally(() => setAddingMyImage(false));
	};

	// Debug-only: stand in for the native file dialogue with a real <input
	// type="file">, so the preview works with actual picked files.
	const onDebugFilesChosen = (evt) => {
		const files = Array.from(evt.target.files || []);
		files.forEach((file, i) => {
			debugImages = debugImages.concat([{
				filename: `${Date.now()}-${i}-${file.name}`,
				url: URL.createObjectURL(file),
			}]);
		});
		evt.target.value = ""; // allow re-picking the same file
		refreshMyImages();
	};

	const onPickMyImage = (item) => setSelectedMyImage(item);

	const onRemoveMyImage = (evt, filename) => {
		evt.stopPropagation();
		if (DEBUG_MY_IMAGES) {
			const removed = debugImages.find(i => i.filename === filename);
			if (removed) URL.revokeObjectURL(removed.url);
			debugImages = debugImages.filter(i => i.filename !== filename);
			refreshMyImages();
		} else {
			window.electronAPI.deleteMyImage(getCurrentUser(), filename).then(refreshMyImages);
		}
		if (selectedMyImage?.filename === filename) setSelectedMyImage(null);
	};

	const getNewImagePosition = () => {
		const images = canvas.images || [];
		const zIndex = images.length > 0 ? getHighestZdepth(images) : 1;

		// Calculate center position based on canvas orientation
		const orientation = canvas.orientation || "portrait";
		const centerX = orientation === "portrait" ? 384 : 550;
		const centerY = orientation === "portrait" ? 550 : 384;

		return { zIndex, centerX, centerY };
	};

	const onLoadMyImage = () => {
		if (!selectedMyImage) {
			setError("Please select an image first.");
			return;
		}
		setError("");
		const { zIndex, centerX, centerY } = getNewImagePosition();
		const { url } = selectedMyImage;
		const newImage = {
			type: "image",
			raster: true,
			x: centerX, y: centerY, angle: 0, size: 300, url, zIndex,
			svg: `<img src="${url}" width="100%" height="100%" draggable="false" style="pointer-events:none;user-select:none;display:block;object-fit:contain;" />`,
		};
		dispatch(addImage(newImage));
		dispatch(cancelMode());
	};

	const onLoadClicked = (ind) => {
		if (inMyImages) {
			onLoadMyImage();
			return;
		}
		if (ind === undefined || ind === null || !window.IMAGE_FILES[ind]) {
			setError("Please select an image first.");
			return;
		}
		setError("");
		dispatch(showLoader(true));
		const url = window.IMAGE_FILES[ind].url;
		const filename = window.IMAGE_FILES[ind].filename;
		const images = canvas.images || [];
		const { zIndex, centerX, centerY } = getNewImagePosition();

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
			<CategoryChooser>
				{inMyImages && (
					(isElectron || DEBUG_MY_IMAGES) ? (
						<button className={cx("primary narrow")} style={{ width: "auto", padding: "0 20px", whiteSpace: "nowrap", backgroundColor: "var(--color-orange-primary)", color: "var(--color-text-primary)" }} onClick={onAddMyImage} disabled={addingMyImage}>
							{addingMyImage ? "Adding…" : "Add my own image"}
						</button>
					) : (
						<span>Adding your own images is only available in the desktop app.</span>
					)
				)}
				{inMyImages && DEBUG_MY_IMAGES &&
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						multiple
						style={{ display: "none" }}
						onChange={onDebugFilesChosen}
					/>
				}
			</CategoryChooser>
			{!inMyImages && <Search />}
			{error &&
				<div style={{ color: "#ff5252", fontWeight: 600, padding: "0 20px 10px" }}>{error}</div>
			}
			<div className={cx("dialogue-inner")}>
				{inMyImages
					? <MyImagesList
						images={myImages}
						selectedFilename={selectedMyImage?.filename}
						onPick={onPickMyImage}
						onRemove={onRemoveMyImage}
					/>
					: <ImageList />
				}
			</div>
		</DraggablePanel>
	);
}

export default DialogueAddImage;