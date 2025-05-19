// import { connect } from "react-redux";
import { useSelector, useDispatch } from 'react-redux';
import { setBrushColour, cancelMode, setMode, updateTextData } from './actions'
import { useState } from "react";
import DraggablePanel from "./DraggablePanel";
import { Constants } from "./constants";
import CSSModules from 'react-css-modules';
import styles from './styles/';

let arr = [];
// button side len
const sidelen = 10;
// the x, y of the first button
const startx = 5;
const starty = 5;
const inc = 0x33;
const inc2 = 0x3300;
const inc3 = 0x330000;
for (let i = 0; i<216; i++) {
    const bb = Math.floor(i)%6;
    const gg = Math.floor(i/6)%6;
    const rr = Math.floor(i/36);
    // set the color
    let c = (rr*inc3)+(gg*inc2)+(bb*inc);
    if (i==0) c = 0xFFFFFF
    if (i==1) c = 0xCCCCCC
    if (i==2) c = 0x999999
    if (i==3) c = 0x666666
    if (i==4) c = 0x333333
    if (i==5) c = 0x010101
    const xinc = Math.floor((i%108)/6);
    const yinc = Math.floor(i/108)*6+i%6;
    const posx = startx+(xinc*sidelen);
    const posy = starty+(yinc*sidelen);
    arr.push({x:posx, y:posy, hex:"#"+c.toString(16)});
}


function DialogueAddColour() {

    const [selectedPotIndex, setselectedPotIndex] = useState(-1);
    const [hoverIndex, setHoverIndex] = useState(-1);

    const dispatch = useDispatch();
    const view = useSelector(state => state.view);
    

    const onClick = (index, hex) => {
        if (view.mode === Constants.MODE_COLOUR_TEXT){
            dispatch(updateTextData('colour', hex));
        } else {
            dispatch(setBrushColour(hex));
            setselectedPotIndex(index);    
        }
    }

    const onClose = () => {
        dispatch(setBrushColour(null));
        if (view.mode === Constants.MODE_COLOUR_TEXT){
            // go back to edit text mode - where we came from
            dispatch(setMode(Constants.MODE_EDIT_TEXT));
        } else {
            dispatch(cancelMode());
        }
    }

    return (
        <DraggablePanel id='add-colour' title="Add Colour" onClose={onClose} closeLabel="Done">
            <div className="inner" style={{position:"relative", width:"665px"}}>
                {arr.map((item, index) => {
                    const defaultBorder = index === selectedPotIndex ? "inset 0px 0px 0px 4px #3300CC" : "inset 0px 0px 0px 2px #ffffff33";
                    const colourPotStyle =  {
                        boxShadow:index === hoverIndex ? "inset 0px 0px 0px 4px #00000099" : defaultBorder,
                        backgroundColor:item.hex
                    }
                    return <div     key={index} 
                                    className = "colour-pot" 
                                    style = {{...colourPotStyle}} 
                                    onClick = {() => onClick(index, item.hex)}
                                    onMouseOver = {() => setHoverIndex(index)}
                            />
                })}
            </div>
        </DraggablePanel>
	);
}

// const mapStateToProps = state => ({
// 	view: state.view
// })
// export default connect(mapStateToProps, null)(DialogueAddColour)

export default CSSModules(DialogueAddColour, styles, {allowMultiple:true});


// addBrush={addBrush} onClose={()=>{
//     dispatch(setBrushColour(null));
//     dispatch(cancelMode());
// }}

