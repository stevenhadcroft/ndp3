import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { cx } from '../styles';
import { cancelMode } from '../features/viewSlice';
import DraggablePanel from './DraggablePanel';

const isElectron = !!window.electronAPI;

const DialoguePdfViewer = ({ file, title }) => {
	const dispatch = useDispatch();
	const iframeRef = useRef(null);

	useEffect(() => {
		const onMessage = async (event) => {
			if (event.origin !== window.location.origin) return;
			const msg = event.data;
			if (!msg) return;

			if (msg.type === 'ndp3-pdf-viewer-close') {
				dispatch(cancelMode());
				return;
			}

			if (msg.type === 'ndp3-pdf-viewer-request-pdf') {
				const contentWindow = iframeRef.current?.contentWindow;
				if (!contentWindow) return;
				const result = await window.electronAPI.readPdfFile(msg.filename);
				if (result.success) {
					contentWindow.postMessage(
						{ type: 'ndp3-pdf-viewer-pdf-data', requestId: msg.requestId, data: result.data },
						window.location.origin
					);
				} else {
					contentWindow.postMessage(
						{ type: 'ndp3-pdf-viewer-pdf-error', requestId: msg.requestId, message: result.error },
						window.location.origin
					);
				}
			}
		};
		window.addEventListener('message', onMessage);
		return () => window.removeEventListener('message', onMessage);
	}, [dispatch]);

	return (
		<DraggablePanel id="pdf-viewer" type="full-page" hideHeader>
			<div className={cx("dialogue-inner")}>
				<iframe
					ref={iframeRef}
					src={`${process.env.PUBLIC_URL}/pdf-viewer/index.html?file=${encodeURIComponent(file)}&title=${encodeURIComponent(title)}&electron=${isElectron ? '1' : '0'}`}
					title={title}
					style={{ width: "100%", height: "100%", border: "none" }}
				/>
			</div>
		</DraggablePanel>
	);
}

export default DialoguePdfViewer;
