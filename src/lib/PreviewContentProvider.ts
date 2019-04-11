import {
    workspace, window, 
    ViewColumn, Uri, WebviewPanel, Disposable 
} from "vscode";
import { dirname } from "path";
import { existsSync, readFileSync } from "fs";
import renderContent from "./renderContent";

const resolveFileOrText = (fileName: string) => {
    console.log(fileName, workspace.textDocuments.map(x => x.fileName));
    let document = workspace.textDocuments.find(e => e.fileName === fileName);

    if (document) {
        return document.getText();
    }
    if (dirname(fileName) && existsSync(fileName)) {
        return readFileSync(fileName, "utf8");
    }
}

export default class HtmlDocumentContentProvider implements Disposable {
    private webPanel: WebviewPanel = undefined
    private _fileName: string;
    private _dataFileName: string;
    
    constructor() {
    }

    public show(): void {
        this.webPanel = window.createWebviewPanel(
            'brazePreviewHtml',
            'Braze Liquid HTML Preview',
            ViewColumn.Beside,
            {}
        );

        this.update();
    }

    public async update(): Promise<void> {
        this.webPanel.webview.html = await this.getHtmlContent();
    }

    public dispose(): void {
        this.webPanel.dispose();
        this.webPanel = undefined;
    }

    public async getHtmlContent(): Promise<string> {
        let templateSource: string;
        let dataSource: string;
        
        if (window.activeTextEditor && window.activeTextEditor.document) {
            let currentFileName = window.activeTextEditor.document.fileName;
            let dataFileName: string;
            let fileName: string;

            if (currentFileName === this._fileName
                 || currentFileName === this._dataFileName) {
                // User swtiched editor to context, just use stored on
                fileName = this._fileName;
                dataFileName = this._dataFileName;
            } else {
                dataFileName = currentFileName + '.json';
                fileName = currentFileName;
            }

            this._fileName = fileName;
            this._dataFileName = dataFileName;
            templateSource = resolveFileOrText(fileName);
            dataSource = resolveFileOrText(dataFileName);
        }
        
        return renderContent(templateSource, dataSource);
    }
}
