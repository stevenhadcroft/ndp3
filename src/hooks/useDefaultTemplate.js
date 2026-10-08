import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTemplateData, updateTemplateData } from '../features/canvasSlice';
import { loadTemplate } from '../loaders';

/**
 * Hook to load default template for the canvas
 * @returns {Function} loadDefaultTemplate function
 */

// Load template so that printing works ok, and also when we click away from an image it deselects

// Data.xml happens to list "Blank - worksheet" first, but relying on that
// ordering is fragile — look it up by title so this stays correct even if
// the worksheet list is ever reordered.
const BLANK_WORKSHEET_TITLE = "Blank - worksheet";

const findBlankWorksheet = () => {
  const files = window.WORKSHEET_FILES || [];
  const blank = files.find(f => f.itemRoot?.getAttribute("Wtitle") === BLANK_WORKSHEET_TITLE);
  return blank || files[0];
};

const useDefaultTemplate = () => {

  const dispatch = useDispatch();
  const view = useSelector(state => state.view);

  // `preserveCustomization` re-applies the current template's fill colours
  // (e.g. re-loading after a PDF viewer visit). Pass false to force a truly
  // blank template regardless of what's currently in the store — needed
  // right after a canvas reset, where the just-dispatched reset hasn't
  // re-rendered yet and `view.templateData` here would still be stale
  // (e.g. the previous signed-in user's customised colours).
  const loadDefaultTemplate = useCallback((preserveCustomization = true) => {
    // console.log('loadDefaultTemplate')
    const url = findBlankWorksheet().url;
    const newTemplate = { type: "image", size: 300, url };

    dispatch(setTemplateData(newTemplate));

    loadTemplate(
      url,
      preserveCustomization ? (view.templateData || {}) : {},
      str => dispatch(updateTemplateData({ key: "svg", value: str }))
    );
  }, [dispatch, view.templateData]);
  
  return loadDefaultTemplate;
};

export default useDefaultTemplate;