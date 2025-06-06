const express = require('express');
const serverless = require('serverless-http');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Database setup for serverless
let db;

const initDatabase = () => {
  if (!db) {
    // In serverless environment, we need to handle database differently
    const dbPath = path.join(__dirname, '../../DB/database.sqlite');
    
    // Check if database exists, if not create fallback
    if (!fs.existsSync(dbPath)) {
      console.log('Database not found, using in-memory fallback');
      db = new sqlite3.Database(':memory:');
      // Create basic tables for fallback
      db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS Scene (
          Id INTEGER PRIMARY KEY,
          Name_EN TEXT,
          Name_DE TEXT,
          CameraStartX REAL DEFAULT 0,
          CameraStartY REAL DEFAULT 5,
          CameraStartZ REAL DEFAULT 10
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS MeasurePoint (
          Id INTEGER PRIMARY KEY,
          Name_EN TEXT,
          Name_DE TEXT,
          SpacePosX REAL DEFAULT 0,
          SpacePosY REAL DEFAULT 0,
          SpacePosZ REAL DEFAULT 0,
          Scene_Id INTEGER
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS Product (
          Name TEXT PRIMARY KEY,
          Object3D_Url TEXT,
          Description_EN TEXT,
          Description_DE TEXT
        )`);
        
        // Insert fallback data
        db.run(`INSERT OR IGNORE INTO Scene (Id, Name_EN, Name_DE) VALUES (1, 'Cable Line', 'Kabellinie')`);
        db.run(`INSERT OR IGNORE INTO MeasurePoint (Id, Name_EN, Name_DE, SpacePosX, SpacePosZ, Scene_Id) VALUES 
          (1, 'Preheating', 'Leitervorheizung', -12, 0, 1),
          (2, 'Extrusion', 'Extruderschmelze', -6, 0, 1),
          (3, 'After Extruder', 'Nach Extruder', 0, 0, 1),
          (4, 'Wall Thickness', 'Wanddicke/Exzentrizität', 6, 0, 1),
          (5, 'Defect Detection', 'Knotendetektion', 12, 0, 1)`);
      });
    } else {
      db = new sqlite3.Database(dbPath);
    }
  }
  return db;
};

// Helper functions
const sendResponse = (res, data, error = null) => {
  if (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  } else {
    res.json({ success: true, data });
  }
};

const queryDb = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const database = initDatabase();
    database.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'OK', timestamp: new Date().toISOString() } });
});

// Scenes
app.get('/scenes', async (req, res) => {
  try {
    const scenes = await queryDb('SELECT * FROM Scene ORDER BY Id');
    sendResponse(res, scenes);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

app.get('/scenes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const scenes = await queryDb('SELECT * FROM Scene WHERE Id = ?', [id]);
    const scene = scenes.length > 0 ? scenes[0] : null;
    sendResponse(res, scene);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

// Scene data (combined endpoint)
app.get('/scenes/:sceneId/data', async (req, res) => {
  try {
    const { sceneId } = req.params;
    
    // Get scene
    const scenes = await queryDb('SELECT * FROM Scene WHERE Id = ?', [sceneId]);
    const scene = scenes.length > 0 ? scenes[0] : null;
    
    if (!scene) {
      return sendResponse(res, null, new Error('Scene not found'));
    }
    
    // Get measure points
    const measurePoints = await queryDb(
      'SELECT * FROM MeasurePoint WHERE Scene_Id = ? ORDER BY Id',
      [sceneId]
    );
    
    // Static objects (fallback)
    const staticObjects = [{
      id: 'neuelinie',
      url: '/api/assets/neuelinie.glb',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
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

// Measure points
app.get('/measurepoints', async (req, res) => {
  try {
    const measurePoints = await queryDb('SELECT * FROM MeasurePoint ORDER BY Id');
    sendResponse(res, measurePoints);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

app.get('/scenes/:sceneId/measurepoints', async (req, res) => {
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

// Products
app.get('/products', async (req, res) => {
  try {
    const products = await queryDb('SELECT * FROM Product ORDER BY Name');
    sendResponse(res, products);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

app.get('/products/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const products = await queryDb('SELECT * FROM Product WHERE Name = ?', [decodeURIComponent(name)]);
    const product = products.length > 0 ? products[0] : null;
    sendResponse(res, product);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

// Products for measure point (simplified)
app.get('/measurepoints/:id/products', async (req, res) => {
  try {
    // For now, return all products (simplified)
    const products = await queryDb('SELECT * FROM Product ORDER BY Name');
    sendResponse(res, products);
  } catch (error) {
    sendResponse(res, null, error);
  }
});

// Static file serving (assets)
app.get('/assets/*', (req, res) => {
  const filePath = req.path.replace('/assets/', '');
  const fullPath = path.join(__dirname, '../../assets/', filePath);
  
  if (fs.existsSync(fullPath)) {
    res.sendFile(fullPath);
  } else {
    res.status(404).json({ success: false, error: 'File not found' });
  }
});

// Fallback for any unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

module.exports.handler = serverless(app);
