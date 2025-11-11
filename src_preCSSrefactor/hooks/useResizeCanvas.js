import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCanvasScale } from '../features/viewSlice';

/**
 * Hook to handle canvas resizing
 * @returns {Function} resizeCanvas function that can be called manually if needed
 */
const useCanvasResize = () => {
  const dispatch = useDispatch();
  
  const resizeCanvas = useCallback(() => {
    let scale = ((window.innerHeight - 60) / 1100);
    dispatch(setCanvasScale(scale));
  }, [dispatch]);
  
  useEffect(() => {
    // Initial resize
    resizeCanvas();
    
    // Add event listener
    window.addEventListener('resize', resizeCanvas);
    
    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [resizeCanvas]);
  
  return resizeCanvas; // Return function in case manual resize is needed
};

export default useCanvasResize;