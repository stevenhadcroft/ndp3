import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTemplateData, updateTemplateData } from '../features/canvasSlice';
import { loadTemplate } from '../loaders';

/**
 * Hook to load default template for the canvas
 * @returns {Function} loadDefaultTemplate function
 */

// Load template so that printing works ok, and also when we click away from an image it deselects			

const useDefaultTemplate = () => {
  
  const dispatch = useDispatch();
  const view = useSelector(state => state.view);
  
  const loadDefaultTemplate = useCallback(() => {
    // console.log('loadDefaultTemplate')
    const url = window.WORKSHEET_FILES[0].url;
    const newTemplate = { type: "image", size: 300, url };
    
    dispatch(setTemplateData(newTemplate));
    
    loadTemplate(
      url, 
      view.templateData || {},
      str => dispatch(updateTemplateData({ key: "svg", value: str }))
    );
  }, [dispatch, view.templateData]);
  
  return loadDefaultTemplate;
};

export default useDefaultTemplate;