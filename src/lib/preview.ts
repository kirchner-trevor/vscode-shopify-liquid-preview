import {
    workspace, window, commands,
    ViewColumn
} from "vscode";

import PREVIEW_URI from "./PREVIEW_URI";

export default () => {
    return commands.executeCommand("vscode.previewHtml", PREVIEW_URI, ViewColumn.Two, "Shopify Liquid HTML Preview");
}