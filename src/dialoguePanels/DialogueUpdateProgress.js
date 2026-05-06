import { useSelector } from 'react-redux';
import { cx } from '../styles';
import DraggablePanel from "./DraggablePanel";

const DialogueUpdateProgress = () => {

    const appUpdateStatus = useSelector(state => state.view.appUpdateStatus);

    //--------------------------------------------------------------
	// Main
	//--------------------------------------------------------------
    return (
        <DraggablePanel type="modal-update">
            <div className={cx("update-progress-header")}>
                Downloading update {appUpdateStatus && appUpdateStatus.version ? `v${appUpdateStatus.version}` : ''}
            </div>
            <div className={cx("dialogue-inner no-scroll")}>
                <div className={cx("update-progress-container")}>
                    <div
                        className={cx("update-progress-bar")}
                        style={{
                            width: `${appUpdateStatus && appUpdateStatus.percent || 0}%`
                        }}
                    />
                </div>
            </div>
        </DraggablePanel>
	);
}

export default DialogueUpdateProgress;
