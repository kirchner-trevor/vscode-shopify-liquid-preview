import {
    workspace, window, commands, 
    TextDocumentContentProvider,
    Event, Uri, EventEmitter, Disposable 
} from "vscode";
import renderContent from "./renderContent";

export default class HtmlDocumentContentProvider implements TextDocumentContentProvider {
    private _onDidChange = new EventEmitter<Uri>();
    private _template: (input: any) => string;
    
    constructor() {
    }

    public provideTextDocumentContent(uri: Uri): string {
        return renderContent(window.activeTextEditor.document);
    }

    get onDidChange(): Event<Uri> {
        return this._onDidChange.event;
    }

    public update(uri: Uri) {
        this._onDidChange.fire(uri);
    }
}
