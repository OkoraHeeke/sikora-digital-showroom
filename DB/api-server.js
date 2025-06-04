const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Datenbank-Verbindung
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

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

// === SZENEN ===
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

// === MESSPUNKTE ===
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

// === PRODUKTE ===
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

// === PRODUKTDETAILS ===
// Product Specifications
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

// Product Features
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

// Product Advantages
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

// Product Installation
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

// Product Datasheet
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

// === KATEGORIEN ===
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

// === MESSPARAMETER ===
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

app.get('/api/measureparameters/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const products = await queryDb(`
      SELECT p.* FROM Product p
      JOIN Join_Product_MeasureParameter jpmp ON p.Name = jpmp.Product_Name
      WHERE jpmp.MeasureParameter_Id = ?
      ORDER BY p.Name
    `, [id]);
    sendResponse(res, products);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

// === KOMPLEXE QUERIES ===
// Produkte für einen bestimmten Messpunkt
app.get('/api/measurepoints/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Erst prüfen ob Messpunkt existiert
    const measurePointExists = await queryDb('SELECT Id, Scene_Id FROM MeasurePoint WHERE Id = ?', [id]);
    if (measurePointExists.length === 0) {
      return sendResponse(res, []);
    }

    const measurePoint = measurePointExists[0];

    // Versuche zuerst Produkte über Messparameter zu finden
    let products = await queryDb(`
      SELECT DISTINCT p.* FROM Product p
      JOIN Join_Product_MeasureParameter jpmp ON p.Name = jpmp.Product_Name
      JOIN Join_MeasurePoint_MeasureParameter jmpm ON jpmp.MeasureParameter_Id = jmpm.MeasureParameter_Id
      WHERE jmpm.MeasurePoint_Id = ?
      AND p.Name NOT IN (
        SELECT COALESCE(amp.Product_Name, '') FROM AntiJoin_MeasurePoint_Product amp
        WHERE amp.MeasurePoint_Id = ?
      )
      ORDER BY p.Name
    `, [id, id]);
    
    // Wenn keine spezifischen Produkte gefunden, lade Produkte für die Szene
    if (products.length === 0) {
      products = await queryDb(`
        SELECT DISTINCT p.* FROM Product p
        JOIN Join_Scene_Product jsp ON p.Name = jsp.Product_Name
        WHERE jsp.Scene_Id = ?
        AND p.Name NOT IN (
          SELECT COALESCE(amp.Product_Name, '') FROM AntiJoin_MeasurePoint_Product amp
          WHERE amp.MeasurePoint_Id = ?
        )
        ORDER BY p.Name
      `, [measurePoint.Scene_Id, id]);
    }
    
    // Wenn immer noch keine Produkte, zeige eine größere Auswahl aller Produkte
    if (products.length === 0) {
      products = await queryDb(`
        SELECT * FROM Product 
        WHERE Name NOT IN (
          SELECT COALESCE(amp.Product_Name, '') FROM AntiJoin_MeasurePoint_Product amp
          WHERE amp.MeasurePoint_Id = ?
        )
        ORDER BY Name
        LIMIT 50
      `, [id]);
    }
    
    sendResponse(res, products);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

// Vollständige Szenen-Daten mit statischen Objekten
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
    
    // Prüfe ob die Tabelle Map_Scene_Object3D_Static_Placement existiert und Spalten hat
    let staticObjects = [];
    try {
      // Korrekte Spaltennamen verwenden: XPosition, YPosition, ZPosition, etc.
      staticObjects = await queryDb(`
        SELECT 
          Object3D_Url as url,
          XPosition, YPosition, ZPosition,
          XRotation, YRotation, ZRotation,
          Scale
        FROM Map_Scene_Object3D_Static_Placement
        WHERE Scene_Id = ?
      `, [id]);
      
    } catch (err) {
      console.warn('Static objects table query failed:', err.message);
      // Fallback: Standard 3D-Objekt für die Szene
      staticObjects = [{
        url: 'neuelinie.glb',
        XPosition: 0,
        YPosition: 0,
        ZPosition: 0,
        XRotation: 0,
        YRotation: 0,
        ZRotation: 0,
        Scale: 1
      }];
    }
    
    const sceneData = {
      scene,
      measurePoints,
      staticObjects: staticObjects.map(obj => ({
        id: obj.url,
        url: obj.url,
        position: [obj.XPosition || 0, obj.YPosition || 0, obj.ZPosition || 0],
        rotation: [obj.XRotation || 0, obj.YRotation || 0, obj.ZRotation || 0],
        scale: [obj.Scale || 1, obj.Scale || 1, obj.Scale || 1],
      }))
    };
    
    sendResponse(res, sceneData);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'OK', timestamp: new Date().toISOString() } });
});

// Placeholder Images Endpoint
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
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  res.send(svg);
});

// Static Assets Serving
app.use('/api/assets', express.static(path.join(__dirname, '..', 'assets'), {
  setHeaders: (res, filepath) => {
    // Set appropriate MIME types and cache headers
    if (filepath.endsWith('.jpg') || filepath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filepath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filepath.endsWith('.glb')) {
      res.setHeader('Content-Type', 'model/gltf-binary');
    } else if (filepath.endsWith('.gltf')) {
      res.setHeader('Content-Type', 'model/gltf+json');
    }
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Fallback for missing assets - serve placeholder
app.get('/api/assets/*', (req, res) => {
  const requestedPath = req.params[0];
  
  if (requestedPath.includes('images/') && (requestedPath.endsWith('.jpg') || requestedPath.endsWith('.jpeg') || requestedPath.endsWith('.png'))) {
    // Redirect to placeholder for missing images
    res.redirect(`/api/placeholder/300/200`);
  } else if (requestedPath.includes('models/') && (requestedPath.endsWith('.glb') || requestedPath.endsWith('.gltf'))) {
    // Return 404 for missing 3D models
    res.status(404).json({ success: false, error: '3D model not found' });
  } else {
    res.status(404).json({ success: false, error: 'Asset not found' });
  }
});

// Debug: Alle Tabellen anzeigen
app.get('/api/debug/tables', async (req, res) => {
  try {
    const tables = await queryDb("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    sendResponse(res, tables);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

// Debug: Tabellen-Schema anzeigen
app.get('/api/debug/schema/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const schema = await queryDb(`PRAGMA table_info('${table}')`);
    sendResponse(res, schema);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down API server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`SIKORA API Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Debug tables: http://localhost:${PORT}/api/debug/tables`);
}); 