import { useSelector } from 'react-redux';
import CSSModules from 'react-css-modules';
import styles from '../styles';
import DraggablePanel from "./DraggablePanel";

const DialogueUpdateProgress = () => {

    const appUpdateStatus = useSelector(state => state.view.appUpdateStatus);

    //--------------------------------------------------------------
	// Main
	//--------------------------------------------------------------
    return (
        <DraggablePanel type="modal-update">
            <div styleName="update-progress-header">
                Downloading Update
            </div>
            <div styleName="dialogue-inner no-scroll">
                <div styleName="update-progress-container">
                    <div 
                        styleName="update-progress-bar"
                        style={{
                            width: `${appUpdateStatus && appUpdateStatus.percent || 0}%`
                        }}
                    />
                </div>
                {/* <div styleName="progress-stats">
                    <span>{Math.round(appUpdateStatus.percent || 0)}%</span>
                    {appUpdateStatus.transferred && (
                        <span>
                            {formatBytes(appUpdateStatus.transferred)} / 
                            {formatBytes(appUpdateStatus.total)}
                        </span>
                    )}
                    {appUpdateStatus.bytesPerSecond && (
                        <span>{formatBytes(appUpdateStatus.bytesPerSecond)}/s</span>
                    )}
                </div> */}
            </div>
        </DraggablePanel>
	);
}

export default CSSModules(DialogueUpdateProgress, styles, {allowMultiple:true});



// credentials from localStorage  Object
// react-dom.production.min.js:189 TypeError: Cannot read properties of undefined (reading 'percent')
//     at DialogueUpdateProgress.js:37:55
//     at s (wrapStatelessFunction.js:64:34)
//     at xi (react-dom.production.min.js:167:137)
//     at xs (react-dom.production.min.js:290:337)
//     at ml (react-dom.production.min.js:280:389)
//     at vl (react-dom.production.min.js:280:320)
//     at wl (react-dom.production.min.js:280:180)
//     at ll (react-dom.production.min.js:273:245)
//     at Rr (react-dom.production.min.js:127:105)
//     at ul (react-dom.production.min.js:274:82)
// fa @ react-dom.production.min.js:189
// VM4 sandbox_bundle:2 Uncaught Error: Cannot read properties of undefined (reading 'percent')
//     at IpcRenderer.emit (VM4 sandbox_bundle:2:45997)
//     at Object.onMessage (VM4 sandbox_bundle:2:121279)