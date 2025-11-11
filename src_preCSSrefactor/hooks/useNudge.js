import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateImageData, updateTextData } from '../features/canvasSlice';
import { Constants, eMode } from '../constants';

const useNudge = () => {
  const dispatch = useDispatch();
  const view = useSelector(state => state.view);
  const canvas = useSelector(state => state.canvas);
  
  // const nudge = useCallback((dir) => {
  const nudge = (dir) => {
    const selectedIndex = canvas.selectedIndex || 0;
    const mode = view.mode;
    let elsToMove = [];
    
    if (mode === eMode.EDIT_IMAGE) {
      elsToMove = [
        {id:`image-${selectedIndex}`, type:"image"},
        {id:`image-viewonly-${selectedIndex}`},
        {id:`rotate`},
        {id:`scale`},
      ];
    } else if (mode === eMode.EDIT_TEXT) {
      elsToMove = [
        {id:`text-${selectedIndex}`, type:"text"},
        {id:`text-viewonly-${selectedIndex}`},
        {id:`rotate`},
        {id:`scale`},
      ];
    }
    
    elsToMove.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) {
        let left = parseInt(el.style.left.split('px')[0]);
        let top = parseInt(el.style.top.split('px')[0]);
        
        if (dir === "left") {
          left -= 10;
        } else if (dir === "right") {
          left += 10;
        } else if (dir === "up") {
          top -= 10;
        } else if (dir === "down") {
          top += 10;
        }
        
        if (item.type === "image") {
          const size = canvas.images[selectedIndex].size;
          const x = left + size/2;
          const y = top + size/2;
          dispatch(updateImageData({index:selectedIndex, key:"x", value:x}))
          dispatch(updateImageData({index:selectedIndex, key:"y", value:y}))
        } else if (item.type === "text" && !view.textfieldFocussed) {
          const size = canvas.texts[selectedIndex].size;
          const x = left + size/2;
          const y = top + size/6;
          dispatch(updateTextData({key:"x", value:x})); // why no 'selectedIndex'
          dispatch(updateTextData({key:"y", value:y})); // why no 'selectedIndex'
        }
      }
    });
  // }, [canvas, view, dispatch]);
  };

  return nudge;
};

export default useNudge;