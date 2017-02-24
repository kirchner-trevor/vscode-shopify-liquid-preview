import {
    TextDocument
} from "vscode";
import { dirname } from "path";
import { existsSync, readFileSync } from "fs";
import Handlebars from "handlebars";

const readJson = (filePath) => {
    if (dirname(filePath) && existsSync(filePath)) {
        return JSON.parse(readFileSync(filePath, 'utf8'));
    }
    return {};
}

export default (activeDocument: TextDocument): string => {
    if (!activeDocument) {
        return `<body>Select document to render</body>`
    }

    let fileName = activeDocument.fileName;
    let dataFileName = fileName + '.json';
    
    let data = readJson(dataFileName);
    let text: string = activeDocument.getText();

    this._template = Handlebars.compile(text);

    try {
        
        return this._template(data);
    } catch (ex) {

        return `
            <body>${ex}</body>
        `;
    }
}