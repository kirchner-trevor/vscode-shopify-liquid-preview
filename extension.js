const vscode = require('vscode');
const liquid = require('liquidjs');
const liquidEngine = new liquid();

function activate(context) {
    const previewContentProvider = new class {
        constructor() {
            this.onDidChangeEmitter = new vscode.EventEmitter();
            this.onDidChange = this.onDidChangeEmitter.event;
            this.previews = {};
        }

        dispose() {
            this.onDidChangeEmitter.dispose();
            this.previews.clear();
        }

        async provideTextDocumentContent(uri) {
            let preview = this.previews[uri.path];

            if (preview.templateUri && preview.templateDirty) {
                try {
                    let templateDocument = await vscode.workspace.openTextDocument(preview.templateUri);
                    preview.template = templateDocument.getText();
                } catch (err) {

                }
            }

            if (preview.dataUri && preview.dataDirty) {
                try {
                    let dataDocument = await vscode.workspace.openTextDocument(preview.dataUri);
                    preview.data = JSON.parse(dataDocument.getText());
                } catch (err) {

                }
            }

            return liquidEngine.parseAndRender(preview.template, preview.data);
        }
    }
    context.subscriptions.push(previewContentProvider);

    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('shopify-liquid-preview', previewContentProvider));

    context.subscriptions.push(vscode.commands.registerCommand('shopifyLiquidPreview.preview', async () => {
        let template = vscode.window.activeTextEditor;
        if (template) {
            let templateUri = template.document.fileName;
            let templateFile = getFilename(templateUri);
            let previewUri = 'Preview ' + templateFile;
            previewContentProvider.previews[previewUri] = {
                templateUri,
                templateDirty: true,
                template: '',
                dataUri: null,
                dataDirty: false,
                data: {}
            };
            let uri = vscode.Uri.parse('shopify-liquid-preview:' + previewUri);
            let doc = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(doc, { preserveFocus: true, preview: false, viewColumn: vscode.ViewColumn.Beside });
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('shopifyLiquidPreview.setPreviewData', async () => {
        let template = vscode.window.activeTextEditor;
        if (template) {
            let dataUris = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                openLabel: 'Set Preview Data'
            });
            if (dataUris && dataUris.length) {
                let previewUri = template.document.fileName;
                previewContentProvider.previews[previewUri].dataUri = dataUris[0].fsPath;
                previewContentProvider.previews[previewUri].dataDirty = true;
                let uri = vscode.Uri.parse('shopify-liquid-preview:' + previewUri);
                previewContentProvider.onDidChangeEmitter.fire(uri);
            }
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('shopifyLiquidPreview.previewWithData', async () => {
        let template = vscode.window.activeTextEditor;
        if (template) {
            let templateUri = template.document.fileName;
            let templateFile = getFilename(templateUri);
            let previewUri = 'Preview ' + templateFile;
            previewContentProvider.previews[previewUri] = {
                template: '',
                data: {}
            };

            let dataUris = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                openLabel: 'Set Preview Data'
            });
            if (dataUris && dataUris.length) {
                previewContentProvider.previews[previewUri].dataUri = dataUris[0].fsPath;
                previewContentProvider.previews[previewUri].dataDirty = true;
            }

            previewContentProvider.previews[previewUri].templateUri = templateUri;
            previewContentProvider.previews[previewUri].templateDirty = true;

            let uri = vscode.Uri.parse('shopify-liquid-preview:' + previewUri);
            let doc = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(doc, { preserveFocus: true, preview: false, viewColumn: vscode.ViewColumn.Beside });
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.document.uri.scheme !== 'shopify-liquid-preview') {
            for (let previewUri in previewContentProvider.previews) {
                let preview = previewContentProvider.previews[previewUri];
                let isTemplate = preview.templateUri === e.document.fileName;
                let isData = preview.dataUri === e.document.fileName;
                if (isTemplate || isData) {
                    previewContentProvider.previews[previewUri].templateDirty = isTemplate;
                    previewContentProvider.previews[previewUri].dataDirty = isData;
                    let uri = vscode.Uri.parse('shopify-liquid-preview:' + previewUri);
                    previewContentProvider.onDidChangeEmitter.fire(uri);
                }
            }
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument((e) => {
        //TODO cleanup previews
    }));

    function getFilename(filename) {
        return filename.substring(filename.lastIndexOf('\\') + 1, filename.length) || filename;
    }
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
}