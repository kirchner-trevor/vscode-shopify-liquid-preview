import {
    workspace, window, commands,
    ViewColumn
} from "vscode";

import PREVIEW_URI from "./PREVIEW_URI";

export default () => {
    return commands.executeCommand("vscode.open", PREVIEW_URI, ViewColumn.Two, "Braze Liquid Plaintext Preview");
}