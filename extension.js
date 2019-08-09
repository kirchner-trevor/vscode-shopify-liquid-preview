const vscode = require('vscode');
const liquid = require('liquidjs');
const liquidEngine = new liquid();

let templateStatusBarItem;
let dataStatusBarItem;

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
            let preview = this.previews[uri.path + '?' + uri.query];

            if (preview.templateUri && preview.templateDirty) {
                try {
                    let templateDocument = await vscode.workspace.openTextDocument(preview.templateUri);
                    preview.template = liquidEngine.parse(templateDocument.getText());
                    preview.templateDirty = false;
                    templateStatusBarItem.text = '$(check) Template';
                    templateStatusBarItem.tooltip = 'All good!';
                } catch (err) {
                    templateStatusBarItem.text = '$(x) Template';
                    templateStatusBarItem.tooltip = err.message;
                }
            }

            if (preview.dataUri && preview.dataDirty) {
                try {
                    let dataDocument = await vscode.workspace.openTextDocument(preview.dataUri);
                    preview.data = JSON.parse(dataDocument.getText());
                    preview.dataDirty = false;
                    dataStatusBarItem.text = '$(check) Data';
                    dataStatusBarItem.tooltip = 'All good!';
                } catch (err) {
                    dataStatusBarItem.text = '$(x) Data';
                    dataStatusBarItem.tooltip = err.message;
                }
            }

            return await liquidEngine.render(preview.template, preview.data);
        }
    }
    context.subscriptions.push(previewContentProvider);

    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('shopify-liquid-preview', previewContentProvider));

    context.subscriptions.push(vscode.commands.registerCommand('shopifyLiquidPreview.preview', async () => {
        let preview = createNewPreview(vscode.window.activeTextEditor && vscode.window.activeTextEditor.document);
        await updatePreviewDataFile(preview);
        previewContentProvider.previews[preview.uri] = preview;

        let uri = vscode.Uri.parse('shopify-liquid-preview:' + preview.uri);
        let doc = await vscode.workspace.openTextDocument(uri);
        let textEditor = await vscode.window.showTextDocument(doc, { preserveFocus: true, preview: false, viewColumn: vscode.ViewColumn.Beside });
        textEditor.
    }));

    context.subscriptions.push(vscode.commands.registerCommand('shopifyLiquidPreview.setPreviewData', async () => {
        let documentPreviews = getDocumentPreviews(previewContentProvider, vscode.window.activeTextEditor && vscode.window.activeTextEditor.document);
        for (let documentPreview of documentPreviews) {
            if (documentPreview.isPreview) {
                await updatePreviewDataFile(documentPreview.preview);

                let uri = vscode.Uri.parse('shopify-liquid-preview:' + documentPreview.preview.uri);
                previewContentProvider.onDidChangeEmitter.fire(uri);
            }
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((e) => {
        let documentPreviews = getDocumentPreviews(previewContentProvider, e.document);
        for (let documentPreview of documentPreviews) {
            if (documentPreview.isTemplate || documentPreview.isData) {
                documentPreview.preview.templateDirty = documentPreview.isTemplate;
                documentPreview.preview.dataDirty = documentPreview.isData;

                let uri = vscode.Uri.parse('shopify-liquid-preview:' + documentPreview.preview.uri);
                previewContentProvider.onDidChangeEmitter.fire(uri);
            }
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument((e) => {
        //TODO cleanup previews
    }));

    templateStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    templateStatusBarItem.show();
    context.subscriptions.push(templateStatusBarItem);
    dataStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    dataStatusBarItem.show();
    context.subscriptions.push(dataStatusBarItem);
}

function createNewPreview(document) {
    function getFilename(filename) {
        return filename.substring(filename.lastIndexOf('\\') + 1, filename.length) || filename;
    }

    let id = Date.now();
    let templateUri = document.fileName;
    let templateFile = getFilename(templateUri);
    let preview = {
        uri: 'Preview ' + templateFile + '?id=' + id,
        templateUri: templateUri,
        templateDirty: true,
        template: [],
        data: {}
    };
    return preview;
}

function getDocumentPreviews(previewContentProvider, document) {
    let documentPreviews = [];
    for (let previewUri in previewContentProvider.previews) {
        let preview = previewContentProvider.previews[previewUri];

        let isData = preview.dataUri === document.fileName;
        let isPreview = previewUri === document.fileName;
        let isTemplate = preview.templateUri === document.fileName;

        if (isData || isPreview || isTemplate) {
            documentPreviews.push({
                preview,
                isData,
                isPreview,
                isTemplate
            });
        }
    }
    return documentPreviews;
}

async function updatePreviewDataFile(preview) {
    let defaultUri = vscode.Uri.parse(preview.templateUri + '.json');
    let dataUris = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        defaultUri: defaultUri,
        openLabel: 'Set Preview Data'
    });
    if (dataUris && dataUris.length) {
        preview.dataUri = dataUris[0].fsPath;
        preview.dataDirty = true;
    }
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
}