import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { cloneDeep, getHighestZdepth } from "../utils";
import {
	setTemplateData,
	updateTemplateData,
	addImage,
	updateImageData,
	addText,
	fileLoadUpdate,
	markLoadFinished,
} from "../features/canvasSlice";
import { loadImage, loadTemplate } from "../loaders";

/**
 * Hook to handle file loading for the canvas component
 */
const useCanvasFileLoader = () => {

	const dispatch = useDispatch();
	const canvas = useSelector(state => state.canvas);

	// Track pending image SVG callbacks and whether the queue is fully drained,
	// so we only flip loading→false once every late callback has dispatched.
	// Otherwise late updateImageData dispatches mark a freshly opened project as modified.
	const pendingImageLoadsRef = useRef(0);
	const queueDoneRef = useRef(false);

	const maybeFinish = () => {
		if (queueDoneRef.current && pendingImageLoadsRef.current === 0) {
			queueDoneRef.current = false;
			dispatch(markLoadFinished());
		}
	};

	useEffect(()=>{
		let data = canvas.fileLoadUpdate ? cloneDeep(canvas.fileLoadUpdate.data) : null;

		if (data){
			if (data.imageData && data.imageData.length>0){
				let item = data.imageData.pop();
				const url = item.url;
				const filename = item.url.split("/")[item.url.split("/").length - 1]; // NOT NEEDED?
				const images = canvas.images || [];
				const zIndex = images.length>0 ? getHighestZdepth(images) : 1;
				const newImage = { ...item, type:"image", zIndex, url};
				const index = images.length; // use length as index for new image

				dispatch(addImage(newImage));
				pendingImageLoadsRef.current += 1;

				const callback1 = (key, svg) => {
					svg = svg.replace('<svg ', `<svg filename="${filename}" `);
					dispatch(updateImageData({index, key, value:svg}));
				}

				// update whole svg data - so when we clone the imgage the svg contained the colours
				const callback2 = () => {
					const el = document.getElementById("image-"+index);
					if (el){
						const svgmarkup = el.innerHTML;
						dispatch(updateImageData({index, key:'svg', value:svgmarkup}));
					} else {
						console.warn("No image element found for index", index);
					}
					pendingImageLoadsRef.current -= 1;
					maybeFinish();
				}

				loadImage(url, index, callback1, newImage, callback2);

				// trigger next item
				dispatch(fileLoadUpdate(data));

			} else if (data.textData && data.textData.length>0){
				let item = data.textData.pop();
				const texts = canvas.texts || [];
				const zIndex = texts.length>0 ? getHighestZdepth(texts) : 1;
				let newText = {...item, type: "text", zIndex};
				dispatch(addText(newText));
				// trigger next item
				dispatch(fileLoadUpdate(data));

			} else if (data.templateData){
				let item = data.templateData;
				const url = item.url;
				const newTemplate = { ...item, type:"image", url};
				dispatch(setTemplateData(newTemplate));
				loadTemplate(url, item || {},
					str => {
						dispatch(updateTemplateData({key:"svg", value:str}));
						queueDoneRef.current = true;
						maybeFinish();
					}
				);
			} else {
				// queue exhausted with no template — wait for any in-flight image loads.
				queueDoneRef.current = true;
				maybeFinish();
			}
		}
	}, [canvas.fileLoadUpdate])

	// return null; // This hook doesn't need to return anything as it just handles side effects
};

export default useCanvasFileLoader;