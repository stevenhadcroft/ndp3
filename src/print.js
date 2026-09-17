
import { isElectronRenderer } from "./utils";

// CSS defines 1in = 96px and 1in = 25.4mm, so this ratio is exact
// and consistent across browsers/Electron for @page sizing.
const PX_PER_MM = 96 / 25.4;

// Physical target sheet: A4.
const PAGE_MM = {
    portrait: { w: 210, h: 297 },
    landscape: { w: 297, h: 210 },
};

export const print = (orientation) => {
    try {
        // Check if canvas element exists
        const canvasElement = document.getElementById("canvas");
        if (!canvasElement) {
            console.error("Canvas element not found");
            return false;
        }

        const pageMm = PAGE_MM[orientation] || PAGE_MM.portrait;
        const pageSizeCss = `${pageMm.w}mm ${pageMm.h}mm`;
        const { w: contentW, h: contentH } = getDimensions(orientation);

        // Scale the existing fixed-px canvas content up to exactly fill the
        // physical page, so print output goes edge-to-edge instead of sitting
        // inside the browser's default @page margins.
        const scaleX = (pageMm.w * PX_PER_MM) / contentW;
        const scaleY = (pageMm.h * PX_PER_MM) / contentH;

        // Build HTML content safely
        const htmlContent = `
            <html>
                <head>
                    <title>NDP3 Speech Builder</title>
                    <style type="text/css">
                        @page { size: ${pageSizeCss}; margin: 0; }
                        html, body { margin: 0; padding: 0; }
                        @media print {
                            @page { size: ${pageSizeCss}; margin: 0; }
                            * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
                        }
                        .page-frame {
                            position: relative;
                            width: ${pageMm.w}mm;
                            height: ${pageMm.h}mm;
                            overflow: hidden;
                        }
                        .print {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: ${contentW}px;
                            height: ${contentH}px;
                            transform: scale(${scaleX}, ${scaleY});
                            transform-origin: top left;
                        }
                    </style>
                </head>
                <body>
                    <div class="page-frame">
                        <div class="print">
                            ${canvasElement.innerHTML}
                        </div>
                    </div>
                </body>
            </html>
        `;

        if (isElectronRenderer() && window.electronAPI) {
            printElectron(htmlContent);
        } else {
            printWeb(htmlContent);
        }

        return true;

    } catch (error) {
        console.error("Print function error:", error);
        return false;
    }
};

const printElectron = (htmlContent) => {
    window.electronAPI.callPrintFunction(htmlContent).then(() => {
        console.log('Main function called from renderer!');
    });
}

const printWeb = (htmlContent) => {
    const win = window.open("", "PRINT");
    if (!win) {
        console.error("Failed to open print window");
        return false;
    }

    win.document.write(htmlContent);
    win.document.close(); // Important: close the document stream

    // Wait a moment for content to load before printing
    setTimeout(() => {
        win.focus();
        win.print();
        win.close();
    }, 100);
}

// Helper function to get dimensions
const getDimensions = (orientation) => {
    return orientation === "landscape"
        ? { w: 1100, h: 768 }
        : { w: 768, h: 1100 };
};
