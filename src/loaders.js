export const loadImage = (url, index, callback1, newImage, callback2) => {
	// const index = imageData.length;
	load(url).then(evt => {
		evt.setAttribute("id", "svg" + index);
		evt.setAttribute("width", "100%");
		evt.setAttribute("height", "100%");
		evt.setAttribute("viewBox", "0 0 500 500");
		
		// console.log('loadImage LOADED imageData ', newImage);

		// DO COLOURS
		setTimeout(()=>{
			for (let key in newImage){
				const colour = newImage[key];
				if (key.substr(0, 4) === "fill"){
					try {
						const id = `makeUnique_${index}^${key}`;
						const fill = document.getElementById(id);
						const path = fill.querySelector("path");
						path.setAttribute("fill", colour);
					} catch (e) {
						console.error(`Error setting fill for ${key} on image ${index}:`, e);
					}
				}
			}
			
			if (callback2) callback2();

			// const el = document.getElementById("image-"+index);
			// if (el){
			// 	const svgmarkup = el.innerHTML;
			// 	dispatch(updateImageData(index, 'svg', svgmarkup));
			// }

		}, 50);

		// importng the XML means duplicate IDs which results in React getting muddled
		// we need to create unique IDs
		var str = new XMLSerializer().serializeToString(evt);
		str = str.replace(/id="/g, 'id="makeUnique_' + index + "^");
		str = str.replace(/xlink:href="#/g, 'xlink:href="#makeUnique_' + index + "^");
		callback1("svg", str);
	});
};

export const loadTemplate = (url, imageData, callback) => {
	load(url).then(evt => {
		evt.setAttribute("id", "template-svg");
		evt.setAttribute("width", "100%");
		evt.setAttribute("height", "100%");
		
		// PROB NOT NEEDED
		// var els = evt.querySelectorAll("g");
		// for (let i = 0; i < els.length; ++i) {
		// 	let id = els[i].id;
		// 	if (id.substr(0, 4) === "fill") {
		// 		const el = evt.getElementById(id);
		// 		const path = el.querySelector("path");
		// 		if (path && imageData[id]) {
		// 			path.setAttribute("fill", imageData[id]);
		// 		}
		// 	}
		// } 
		setTimeout(()=>{
			for (let key in imageData){
				const colour = imageData[key];
				// console.log('colour ', colour);
				if (key.substr(0, 4) === "fill"){
					const id = `makeUnique_template_0^${key}`;
					const fill = document.getElementById(id);
					const path = fill.querySelector("path");
					path.setAttribute("fill", colour);		
				}
			}
		}, 50);

		// importng the XML means duplicate IDs which results in React getting muddled
		// we need to create unique IDs
		var str = new XMLSerializer().serializeToString(evt);
		str = str.replace(/id="/g, 'id="makeUnique_template_' + 0 + "^");
		str = str.replace(/xlink:href="#/g, 'xlink:href="#makeUnique_template_' + 0 + "^");

		callback(str);
	});
};

export const loadImageDirectoryData = () => {
	return new Promise((resolve, reject) => {
		load("./data/data.xml").then(evt => {
			const imageNodes = evt.querySelectorAll("soundImage");
			let imageFiles = [];
			imageNodes.forEach(item => {
				imageFiles.push({
					url:'./imgs/sounds/'+item.getAttribute('Sfile'), 
					filename:item.getAttribute('Sfile'), 
					itemRoot:item
				});
			});
			window.IMAGE_FILES = imageFiles;
			
			const worksheetNodes = evt.querySelectorAll("worksheet");
			let worksheetFiles = [];
			worksheetNodes.forEach(item => {
				worksheetFiles.push({
					url:'./imgs/templates/'+item.getAttribute('Wfile'),
					filename:item.getAttribute('Wfile'), 
					itemRoot:item
				});
			});
			window.WORKSHEET_FILES = worksheetFiles;
			resolve();
		});
});
}

export const load = (path) => {
	return new Promise((resolve, reject) => {
		var xhr = new XMLHttpRequest();
		xhr.onload = function(e) {
			try {
				if (xhr.readyState === 4 && xhr.status === 200) {
					resolve(xhr.responseXML.documentElement);
				}
			} catch (e) {
				// console.log(e);
			}
		};
		xhr.open("GET", path, true);
		xhr.overrideMimeType("text/xml");
		xhr.responseType = "document";
		xhr.send();
	});
	// reject(err)
}