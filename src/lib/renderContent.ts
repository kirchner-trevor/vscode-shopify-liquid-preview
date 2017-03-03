import Handlebars from "handlebars";

export default (templateSource, dataSource): string => {
    if (!templateSource) {
        return "<body>Select document to render</body>";
    }

    try {   
        let data = JSON.parse(dataSource || "{}");
        let template = Handlebars.compile(templateSource);
        return template(data);
    } catch (ex) {
        return `
            <body>
                <h2>Error occured</h2>
                <pre>${ex}</pre>
            </body>
        `;
    }
}