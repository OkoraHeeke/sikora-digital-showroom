const serverless = require('serverless-http');

// Import the existing API server logic
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database - for Netlify Functions, database will be read-only
const dbPath = path.join(__dirname, '../../DB/database.sqlite');
let db;

try {
  db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      // Create in-memory database with mock data as fallback
      db = new sqlite3.Database(':memory:');
    } else {
      console.log('Connected to SQLite database');
    }
  });
} catch (error) {
  console.error('Database initialization failed:', error);
  db = new sqlite3.Database(':memory:');
}

// Helper function for API responses
const sendResponse = (res, data, error = null) => {
  if (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  } else {
    res.json({ success: true, data });
  }
};

// Helper function for database queries
const queryDb = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// === ESSENTIAL API ROUTES ===

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: 'netlify-functions'
    }
  });
});

// Scenes
app.get('/api/scenes', async (req, res) => {
  try {
    const scenes = await queryDb('SELECT * FROM Scene ORDER BY Id');
    sendResponse(res, scenes);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

app.get('/api/scenes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const scenes = await queryDb('SELECT * FROM Scene WHERE Id = ?', [id]);
    const scene = scenes.length > 0 ? scenes[0] : null;
    sendResponse(res, scene);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

// Measure Points
app.get('/api/scenes/:sceneId/measurepoints', async (req, res) => {
  try {
    const { sceneId } = req.params;
    const measurePoints = await queryDb(
      'SELECT * FROM MeasurePoint WHERE Scene_Id = ? ORDER BY Id',
      [sceneId]
    );
    sendResponse(res, measurePoints);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

app.get('/api/measurepoints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const measurePoints = await queryDb('SELECT * FROM MeasurePoint WHERE Id = ?', [id]);
    const measurePoint = measurePoints.length > 0 ? measurePoints[0] : null;
    sendResponse(res, measurePoint);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

// Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await queryDb('SELECT * FROM Product ORDER BY Name');
    sendResponse(res, products);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

app.get('/api/products/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const products = await queryDb('SELECT * FROM Product WHERE Name = ?', [decodeURIComponent(name)]);
    const product = products.length > 0 ? products[0] : null;
    sendResponse(res, product);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

// Product Details
app.get('/api/products/:name/specifications', async (req, res) => {
  try {
    const { name } = req.params;
    const specifications = await queryDb(`
      SELECT * FROM ProductSpecification
      WHERE Product_Name = ?
      ORDER BY SortOrder, Id
    `, [decodeURIComponent(name)]);
    sendResponse(res, specifications);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

app.get('/api/products/:name/features', async (req, res) => {
  try {
    const { name } = req.params;
    const features = await queryDb(`
      SELECT * FROM ProductFeature
      WHERE Product_Name = ?
      ORDER BY SortOrder, Id
    `, [decodeURIComponent(name)]);
    sendResponse(res, features);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

app.get('/api/products/:name/advantages', async (req, res) => {
  try {
    const { name } = req.params;
    const advantages = await queryDb(`
      SELECT * FROM ProductAdvantage
      WHERE Product_Name = ?
      ORDER BY SortOrder, Id
    `, [decodeURIComponent(name)]);
    sendResponse(res, advantages);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

app.get('/api/products/:name/installation', async (req, res) => {
  try {
    const { name } = req.params;
    const installation = await queryDb(`
      SELECT * FROM ProductInstallation
      WHERE Product_Name = ?
      LIMIT 1
    `, [decodeURIComponent(name)]);
    sendResponse(res, installation.length > 0 ? installation[0] : null);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

app.get('/api/products/:name/datasheet', async (req, res) => {
  try {
    const { name } = req.params;
    const datasheet = await queryDb(`
      SELECT * FROM ProductDatasheet
      WHERE Product_Name = ?
      LIMIT 1
    `, [decodeURIComponent(name)]);
    sendResponse(res, datasheet.length > 0 ? datasheet[0] : null);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

// Categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await queryDb('SELECT * FROM ProductCategory ORDER BY Id');
    sendResponse(res, categories);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

app.get('/api/categories/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const products = await queryDb(`
      SELECT p.* FROM Product p
      JOIN Join_Product_Category jpc ON p.Name = jpc.Product_Name
      WHERE jpc.Category_Id = ?
      ORDER BY p.Name
    `, [id]);
    sendResponse(res, products);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

// Measure Parameters
app.get('/api/measureparameters', async (req, res) => {
  try {
    const parameters = await queryDb('SELECT * FROM MeasureParameter ORDER BY Id');
    sendResponse(res, parameters);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

app.get('/api/measurepoints/:id/parameters', async (req, res) => {
  try {
    const { id } = req.params;
    const parameters = await queryDb(`
      SELECT mp.* FROM MeasureParameter mp
      JOIN Join_MeasurePoint_MeasureParameter jmpm ON mp.Id = jmpm.MeasureParameter_Id
      WHERE jmpm.MeasurePoint_Id = ?
      ORDER BY mp.Id
    `, [id]);
    sendResponse(res, parameters);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

// Products for Measure Points
app.get('/api/measurepoints/:id/products', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if measure point exists
    const measurePointExists = await queryDb('SELECT Id, Scene_Id FROM MeasurePoint WHERE Id = ?', [id]);
    if (measurePointExists.length === 0) {
      return sendResponse(res, []);
    }

    const measurePoint = measurePointExists[0];

    // Try to find products via measure parameters
    let products = await queryDb(`
      SELECT DISTINCT p.* FROM Product p
      JOIN Join_Product_MeasureParameter jpmp ON p.Name = jpmp.Product_Name
      JOIN Join_MeasurePoint_MeasureParameter jmpm ON jpmp.MeasureParameter_Id = jmpm.MeasureParameter_Id
      WHERE jmpm.MeasurePoint_Id = ?
      ORDER BY p.Name
    `, [id]);

    // If no specific products found, load products for the scene
    if (products.length === 0) {
      products = await queryDb(`
        SELECT DISTINCT p.* FROM Product p
        JOIN Join_Scene_Product jsp ON p.Name = jsp.Product_Name
        WHERE jsp.Scene_Id = ?
        ORDER BY p.Name
      `, [measurePoint.Scene_Id]);
    }

    // If still no products, show a general selection
    if (products.length === 0) {
      products = await queryDb(`
        SELECT * FROM Product
        ORDER BY Name
        LIMIT 50
      `, []);
    }

    sendResponse(res, products);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

// Complete Scene Data
app.get('/api/scenes/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;

    const [scenes, measurePoints] = await Promise.all([
      queryDb('SELECT * FROM Scene WHERE Id = ?', [id]),
      queryDb('SELECT * FROM MeasurePoint WHERE Scene_Id = ? ORDER BY Id', [id])
    ]);

    const scene = scenes.length > 0 ? scenes[0] : null;
    if (!scene) {
      return sendResponse(res, null, new Error('Scene not found'));
    }

    // Static objects (fallback for now)
    const staticObjects = [{
      id: 'neuelinie.glb',
      url: 'neuelinie.glb',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    }];

    const sceneData = {
      scene,
      measurePoints,
      staticObjects
    };

    sendResponse(res, sceneData);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

// Placeholder Images
app.get('/api/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  const w = parseInt(width) || 300;
  const h = parseInt(height) || 200;

  // Generate a simple SVG placeholder
  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <rect x="2" y="2" width="${w-4}" height="${h-4}" fill="none" stroke="#003A62" stroke-width="2" stroke-dasharray="5,5"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#003A62" font-family="Arial" font-size="16" font-weight="bold">
        SIKORA
      </text>
      <text x="50%" y="60%" text-anchor="middle" dy=".3em" fill="#666" font-family="Arial" font-size="12">
        ${w} × ${h}
      </text>
    </svg>
  `;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(svg);
});

// Default handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.path
  });
});

// Export for Netlify Functions
module.exports.handler = serverless(app);
