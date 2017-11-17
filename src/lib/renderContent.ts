let Liquid = require("liquidjs");
let LiquidEngine = Liquid();

export default (templateSource, dataSource): Promise<string> => {
  return Promise.resolve()
    .then(() => {
      if (!templateSource) {
        return "<body>Select document to render</body>";
      }

      let data = JSON.parse(dataSource || "{}");
      return LiquidEngine.parseAndRender(templateSource, data);
    })
    .catch((error) => {
      return `
          <body>
              <h2>Error occured</h2>
              <pre>${error.message}</pre>
          </body>
      `;
    });
}