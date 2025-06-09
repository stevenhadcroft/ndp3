

// export const loadImageData = (path) => {
// 	return new Promise((resolve, reject) => {
// 		var xhr = new XMLHttpRequest();
// 		xhr.onload = function(e) {
// 			try {
// 				if (xhr.readyState == 4 && xhr.status == 200) {
// 					resolve(xhr.responseXML.documentElement);
// 				}
// 			} catch (e) {
// 				console.log(e);
// 			}
// 		};
// 		xhr.open("GET", path, true);
// 		xhr.overrideMimeType("text/xml");
// 		xhr.responseType = "document";
// 		xhr.send();
// 	});
// 	// reject(err)
// }

const clone = (item) => {
    if (!item) { return item; } // null, undefined values check

    var types = [Number, String, Boolean],
        result;

    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach(function (type) {
        if (item instanceof type) {
            result = type(item);
        }
    });

    if (typeof result == "undefined") {
        if (Object.prototype.toString.call(item) === "[object Array]") {
            result = [];
            item.forEach(function (child, index, array) {
                result[index] = clone(child);
            });
        } else if (typeof item == "object") {
            // testing that this is DOM
            if (item.nodeType && typeof item.cloneNode == "function") {
                result = item.cloneNode(true);
            } else if (!item.prototype) { // check that this is a literal
                if (item instanceof Date) {
                    result = new Date(item);
                } else {
                    // it is an object literal
                    result = {};
                    for (var i in item) {
                        result[i] = clone(item[i]);
                    }
                }
            } else {
                // depending what you would like here,
                // just keep the reference, or create new object
                if (false && item.constructor) {
                    // would not advice to do that, reason? Read below
                    result = new item.constructor();
                } else {
                    result = item;
                }
            }
        } else {
            result = item;
        }
    }

    return result;
}

export const cloneDeep = clone;

/*
export const cloneDeepOLD = (entity, cache = new WeakMap()) => {
    const referenceTypes = ["Array", "Object", "Map", "Set", "WeakMap", "WeakSet"];
    const entityType = Object.prototype.toString.call(entity);
    if (!new RegExp(referenceTypes.join("|")).test(entityType)) return entity;
    if (cache.has(entity)) {
        return cache.get(entity);
    }
    const c = new entity.constructor();

    if (entity instanceof Map || entity instanceof WeakMap) {
        entity.forEach((value, key) => c.set(cloneDeep(key), cloneDeep(value)));
    }
    if (entity instanceof Set || entity instanceof WeakSet) {
        entity.forEach(value => c.add(cloneDeep(value)));
    }
    cache.set(entity, c);
    return Object.assign(c, ...Object.keys(entity).map(prop => ({ [prop]: cloneDeep(entity[prop], cache) })));
};
*/

// export const print = () => {
// 	var win = window.open("", "PRINT");
// 	win.document.write("<html><head><title>NDP3 Speech Builder</title>");
// 	win.document.write('</head><body><div style="position:absolute; height:1120px; width:800px; overflow:hidden;>');
// 	win.document.write(document.getElementById("canvas").innerHTML);
// 	win.document.write("</div></body></html>");
// 	win.focus(); // necessary for IE >= 10*/
// 	win.print();
// 	win.close();
// 	return true;
// };

export const print = (orientation) => {

    // document.getElementById('template').style.transform = "rotate(90deg)";
    var win = window.open("", "PRINT");

    win.document.write(`<html><head><title>NDP3 Speech Builder</title>`);
    win.document.write(`<style type="text/css">@page { size: ${orientation}; }</style>`);
    win.document.write(`<style type="text/css" media="print">`);
    win.document.write(`@page { size: ${orientation}; }`);
    win.document.write(`* {-webkit-print-color-adjust: exact !important; color-adjust: exact !important;}`);
    win.document.write(`</style>`);
    win.document.write(`</head><body>`);

    let w, h;
    if (orientation === "landscape") {
        w = 1100;
        h = 768;
    } else {
        w = 768;
        h = 1100;
    }
    //border:solid 3px #000; 
    win.document.write(`<div style="position:absolute; width:${w}px; height:${h}px; overflow:hidden;>`);
    win.document.write(document.getElementById("canvas").innerHTML);
    win.document.write("</div>");
    win.document.write("</body></html>");

    win.focus(); // necessary for IE >= 10*/
    win.print();
    win.close();
    return true;
};

export const makeSVGgrabbable = (view) => {
    // make svgs grabbable
    // but setting these w/h distorts the svg of rotated
    // therefore we need to remove rotate, set w/h, then reapply rotate
    let svgElements = document.body.querySelectorAll('svg');
    svgElements.forEach(function (item) {
        const rot = item.parentElement.style.transform;
        item.parentElement.style.transform = "rotate(0deg)";
        item.setAttribute("width", item.getBoundingClientRect().width / view.canvasScale);
        item.setAttribute("height", item.getBoundingClientRect().height / view.canvasScale);
        item.parentElement.style.transform = rot;
    });
}

export const makeSVGgrabbableReset = () => {
    // set back to 100% - otherwith scaling in app doesn't work
    let svgElements = document.body.querySelectorAll('svg');
    svgElements.forEach(function (item) {
        item.setAttribute("width", "100%");
        item.setAttribute("height", "100%");
    });
}

export const validateKey = (key) => {
    // ---------------
    // total gotta be 80
    // ---------------
    let value = 0;
    for (let i in key) {
        if (key[i] >= "A" && key[i] <= "Z") {
            const n = key[i].charCodeAt(0) - 64;
            value += n;
        }
        if (key[i] >= "0" && key[i] <= "9") {
            const n = Math.floor(key[i]);
            value += n;
        }
    }
    console.log(value);
    return value === 80 ? true : false;
    // return value === 80 ? true : false;
}


export const getHighestZdepth = (arr) => {
    return Math.max.apply(Math,
        arr.map(function(o) {
            return o.zIndex + 1;
        })
    );
};


