import {
    workspace, window, commands,
    ExtensionContext, TextEditorSelectionChangeEvent, TextDocumentChangeEvent
} from "vscode";

import PreviewContentProvider from './lib/PreviewContentProvider';
import PREVIEW_URL from './lib/PREVIEW_URI';
import preview from './lib/preview';
import previewText from './lib/previewText';

export function activate(context: ExtensionContext) {

    let provider = new PreviewContentProvider();

    context.subscriptions.push(
        // Preview providers
        workspace.registerTextDocumentContentProvider("braze-liquid-preview", provider),

        // Global handlers
        window.onDidChangeTextEditorSelection((e: TextEditorSelectionChangeEvent) => {
            if (e.textEditor === window.activeTextEditor) {
                provider.update(PREVIEW_URL);
            }
        }),
        workspace.onDidChangeTextDocument((e: TextDocumentChangeEvent) => {
            if (e.document === window.activeTextEditor.document) {
                provider.update(PREVIEW_URL);
            }
        }),

        // Commands
        commands.registerCommand('brazeLiquidPreview.preview', preview),
        commands.registerCommand('brazeLiquidPreview.previewText', previewText)
    );
}

export function deactivate() {
}