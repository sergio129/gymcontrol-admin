export default function handler(req, res) {
  // Importar la aplicación Express
  const app = require('./index.ts').default || require('./index.ts');
  
  // Ejecutar la aplicación
  return app(req, res);
}
