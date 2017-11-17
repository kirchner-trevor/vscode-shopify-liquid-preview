import {
    workspace, window, commands, 
    TextDocumentContentProvider,
    Event, Uri, EventEmitter, Disposable 
} from "vscode";
import { dirname } from "path";
import { existsSync, readFileSync } from "fs";
import renderContent from "./renderContent";

const resolveFileOrText = fileName => {
    console.log(fileName, workspace.textDocuments.map(x => x.fileName));
    let document = workspace.textDocuments.find(e => e.fileName === fileName);

    if (document) {
        return document.getText();
    }
    if (dirname(fileName) && existsSync(fileName)) {
        return readFileSync(fileName, "utf8");
    }
}

export default class HtmlDocumentContentProvider implements TextDocumentContentProvider {
    private _onDidChange = new EventEmitter<Uri>();
    private _fileName: string;
    private _dataFileName: string;
    
    constructor() {
    }

    public provideTextDocumentContent(uri: Uri): Promise<string> {
        let templateSource;
        let dataSource;
        
        if (window.activeTextEditor && window.activeTextEditor.document) {
            let currentFileName = window.activeTextEditor.document.fileName;
            let dataFileName;
            let fileName;

           
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

    get onDidChange(): Event<Uri> {
        return this._onDidChange.event;
    }

    public update(uri: Uri) {
        this._onDidChange.fire(uri);
    }
}
