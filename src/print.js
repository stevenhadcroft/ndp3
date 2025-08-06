
import { isElectron, isElectronRenderer } from "./utils";

export const print = (orientation) => {
    try {
        // Check if canvas element exists
        const canvasElement = document.getElementById("canvas");
        if (!canvasElement) {
            console.error("Canvas element not found");
            return false;
        }

        // Build HTML content safely
        const htmlContent = `
            <html>
                <head>
                    <title>NDP3 Speech Builder</title>
                    <style type="text/css">
                        @page { size: ${orientation}; }
                        @media print {
                            @page { size: ${orientation}; }
                            * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
                        }
                        .print {
                            position: absolute;
                            width:${getDimensions(orientation).w}px; 
                            height:${getDimensions(orientation).h}px;
                            overflow:hidden;
                        }
                    </style>
                </head>
                <body>
                    <div class="print">
                        ${canvasElement.innerHTML}
                    </div>
                </body>
            </html>
        `;

        // size: ${orientation === 'landscape' ? '11in 8.5in' : '8.5in 11in'};
        const htmlContentElectron = `
            <html>
            <head>
                <title>NDP3 Speech Builder</title>
                <style>
                .landscape {
                    position: absolute;
                    top: -80px;
                    left: -40px;
                    width: 100vh; 
                    height: 100vw; 
                    transform: rotate(-90deg) scale(1.41);
                }
                .portrait {
                    position: absolute;
                    width:${getDimensions(orientation).w}px; 
                    height:${getDimensions(orientation).h}px;
                }
                </style>
            </head>
            <body>
                <div class=${orientation}>
                    ${canvasElement.innerHTML}
                </div>
            </body>
            </html>
        `;
        
        printElectron(htmlContentElectron);
        
        // if (isElectronRenderer()) {
        //     // Use Electron's native print API
        //     // printElectron(htmlContent);
        //     alert("Printing in Electron Renderer");
        //     printElectron(htmlContentElectron);
        // } else {        
        //     alert("Printing in Web Browser");
        //     // Fallback to browser printing
        //     printWeb(htmlContent);
        // }

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

