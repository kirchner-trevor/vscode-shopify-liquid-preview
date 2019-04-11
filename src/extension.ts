import {
    workspace, window, commands, 
    ExtensionContext, TextEditorSelectionChangeEvent, 
    TextDocumentChangeEvent
} from "vscode";

import PreviewContentProvider from './lib/PreviewContentProvider';

export function activate(context: ExtensionContext) {

    let provider = new PreviewContentProvider();

    context.subscriptions.push(
        // Global handlers
        window.onDidChangeTextEditorSelection(async (e: TextEditorSelectionChangeEvent) => {
            if (e.textEditor === window.activeTextEditor) {
                provider.update();
            }
        }),

        workspace.onDidChangeTextDocument(async (e: TextDocumentChangeEvent) => {
            if (e.document === window.activeTextEditor.document) {
                console.log('changed!');
                provider.update();
            }
        }),

        // Commands
        commands.registerCommand('brazeLiquidPreview.preview', () => { provider.show() }),
    );
}

export function deactivate() {
}