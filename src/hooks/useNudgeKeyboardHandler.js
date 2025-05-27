import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useNudge from './useNudge';
import { eMode } from '../constants';
import { deleteImage, deleteText } from '../features/canvasSlice';
import { cancelMode } from '../features/viewSlice';

const useNudgeKeyboardHandler = () => {
  const dispatch = useDispatch();
  const view = useSelector(state => state.view);
  const nudge = useNudge();

  // Handle key press events
  const handleKeyPress = useCallback((evt) => {
    if (evt.keyCode === 8) {
      if (view.mode === eMode.EDIT_IMAGE) {
        dispatch(deleteImage());
        dispatch(cancelMode());
        
    } else if (view.mode === eMode.EDIT_TEXT) {
        dispatch(deleteText());
        dispatch(cancelMode());
      }
    } else if (evt.keyCode === 39) {
      nudge("right");
    } else if (evt.keyCode === 37) {
      nudge("left");
    } else if (evt.keyCode === 38) {
      nudge("up");
    } else if (evt.keyCode === 40) {
      nudge("down");
    }
  }, [nudge, dispatch]);
  
  // Set up and clean up event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
  
  return handleKeyPress; // Return in case you need to use it elsewhere
}

export default useNudgeKeyboardHandler;