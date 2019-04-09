import Liquid from 'liquidjs';
import brazeFilters from './braze/filters';
import brazeTags from './braze/tags';

const registerBrazeFilters = (engine: Liquid) => {
  Object.keys(brazeFilters).forEach((name) => {
    engine.registerFilter(name, brazeFilters[name]);
  });
}

const registerBrazeTags = (engine: Liquid) => {
  Object.keys(brazeTags).forEach((name) => {
    engine.registerTag(name, brazeTags[name]);
  });
};

export default (templateSource, dataSource): Promise<string> => {
  return Promise.resolve()
    .then(() => {
      if (!templateSource) {
        return "<body>Select document to render</body>";
      }

      const engine = new Liquid();
      
      registerBrazeFilters(engine);
      registerBrazeTags(engine);

      let data = JSON.parse(dataSource || "{}");
      return engine.parseAndRender(templateSource, data);
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