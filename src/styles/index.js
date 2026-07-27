import buttons from './buttons.module.css';
import dialogue from './dialogue.module.css';
import layout from './layout.module.css';
import ui from './ui.module.css';
import canvas from './canvas.module.css';
import toolbarStyles from './toolbar.module.css';


const styles = {
    ...buttons,
    ...dialogue,
    ...layout,
    ...ui,
    ...canvas,
    ...toolbarStyles
};

export default styles;

// Build a `cx` helper bound to a specific module map. Unknown tokens pass
// through so global classes still work.
export const makeCx = (modules) => (str) => {
    if (!str) return '';
    return String(str).split(/\s+/).filter(Boolean).map(s => modules[s] || s).join(' ');
};

export const cx = makeCx(styles);
