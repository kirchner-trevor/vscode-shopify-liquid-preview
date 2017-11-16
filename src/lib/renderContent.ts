let ShopifyLiquid = require("shopify-liquid")();

export default (templateSource, dataSource): string => {
    if (!templateSource) {
        return "<body>Select document to render</body>";
    }

    try {   
        let data = JSON.parse(dataSource || "{}");
        let template = ShopifyLiquid.parse(templateSource);
        return ShopifyLiquid.render(template, data);
    } catch (ex) {
        return `
            <body>
                <h2>Error occured</h2>
                <pre>${ex}</pre>
            </body>
        `;
    }
}