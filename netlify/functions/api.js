const express = require('express');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());

// Simple in-memory data store (no sqlite3 dependency issues)
const data = {
  scenes: [
    {
      Id: 1,
      Name_EN: 'Wire & Cable CV Line',
      Name_DE: 'Draht & Kabel CV Linie',
      CameraStartX: 3.0,
      CameraStartY: 3.0,
      CameraStartZ: 3.0,
    }
  ],
  measurePoints: [
    {
      Id: 1,
      Name_EN: 'Inlet Zone',
      Name_DE: 'Einzugszone',
      SpacePosX: -12.31,
      SpacePosY: 0.0,
      SpacePosZ: 0.0,
      Scene_Id: 1,
    },
    {
      Id: 2,
      Name_EN: 'Extrusion Zone',
      Name_DE: 'Extruderschmelze',
      SpacePosX: -0.03,
      SpacePosY: 0.0,
      SpacePosZ: 0.0,
      Scene_Id: 1,
    },
    {
      Id: 3,
      Name_EN: 'After Extruder',
      Name_DE: 'Nach Extruder',
      SpacePosX: 0.0,
      SpacePosY: 0.0,
      SpacePosZ: 0.0,
      Scene_Id: 1,
    },
    {
      Id: 4,
      Name_EN: 'Cooling Zone',
      Name_DE: 'Kühlzone',
      SpacePosX: 13.63,
      SpacePosY: 0.0,
      SpacePosZ: 0.0,
      Scene_Id: 1,
    },
    {
      Id: 5,
      Name_EN: 'Wall Thickness/Eccentricity',
      Name_DE: 'Wanddicke/Exzentrizität',
      SpacePosX: 4.85,
      SpacePosY: 1.0,
      SpacePosZ: 0.0,
      Scene_Id: 1,
    }
  ],
  products: [
    {
      Name: 'CENTERVIEW 8000',
      Object3D_Url: '/api/assets/models/CENTERVIEW_8000.glb',
      Description_EN: 'CENTERVIEW 8000 laser measurement',
      Description_DE: 'CENTERVIEW 8000 Lasermessung'
    },
    {
      Name: 'X-RAY 8000 NXT',
      Object3D_Url: '/api/assets/models/X-RAY_8000_NXT.glb',
      Description_EN: 'X-RAY 8000 NXT wall thickness measurement',
      Description_DE: 'X-RAY 8000 NXT Wanddickenmessung'
    },
    {
      Name: 'LASER 2000 D',
      Object3D_Url: '/api/assets/models/LASER_2000_D.glb',
      Description_EN: 'LASER 2000 D diameter measurement',
      Description_DE: 'LASER 2000 D Durchmessermessung'
    },
    {
      Name: 'SPARK 8000',
      Object3D_Url: '/api/assets/models/SPARK_8000.glb',
      Description_EN: 'SPARK 8000 spark testing',
      Description_DE: 'SPARK 8000 Funkenprüfung'
    },
    {
      Name: 'PREHEATER 6000',
      Object3D_Url: '/api/assets/models/PREHEATER_6000.glb',
      Description_EN: 'PREHEATER 6000 conductor preheating',
      Description_DE: 'PREHEATER 6000 Leitervorheizung'
    }
  ]
};

// Helper function for API responses
const sendResponse = (res, responseData, error = null) => {
  if (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  } else {
    res.json({ success: true, data: responseData });
  }
};

// Health check
app.get('/health', (req, res) => {
  console.log('Health check called');
  res.json({ 
    success: true, 
    data: { 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      message: 'SIKORA API is running' 
    } 
  });
});

// Scenes
app.get('/scenes', (req, res) => {
  console.log('Scenes requested');
  sendResponse(res, data.scenes);
});

app.get('/scenes/:id', (req, res) => {
  const { id } = req.params;
  const scene = data.scenes.find(s => s.Id == id);
  sendResponse(res, scene);
});

// Scene data (combined endpoint)
app.get('/scenes/:sceneId/data', (req, res) => {
  const { sceneId } = req.params;
  console.log('Scene data requested for ID:', sceneId);
  
  const scene = data.scenes.find(s => s.Id == sceneId);
  if (!scene) {
    return sendResponse(res, null, new Error('Scene not found'));
  }
  
  const measurePoints = data.measurePoints.filter(mp => mp.Scene_Id == sceneId);
  
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
});

// Measure points
app.get('/measurepoints', (req, res) => {
  sendResponse(res, data.measurePoints);
});

app.get('/scenes/:sceneId/measurepoints', (req, res) => {
  const { sceneId } = req.params;
  const measurePoints = data.measurePoints.filter(mp => mp.Scene_Id == sceneId);
  sendResponse(res, measurePoints);
});

// Products
app.get('/products', (req, res) => {
  console.log('Products requested');
  sendResponse(res, data.products);
});

app.get('/products/:name', (req, res) => {
  const { name } = req.params;
  const product = data.products.find(p => p.Name === decodeURIComponent(name));
  sendResponse(res, product);
});

// Products for measure point
app.get('/measurepoints/:id/products', (req, res) => {
  // Return all products for simplicity
  sendResponse(res, data.products);
});

// Static file serving placeholder
app.get('/assets/*', (req, res) => {
  res.status(404).json({ success: false, error: 'Static files not available in this environment' });
});

// Fallback for any unmatched routes
app.use('*', (req, res) => {
  console.log('Unknown route requested:', req.path);
  res.status(404).json({ success: false, error: 'Endpoint not found', path: req.path });
});

// Add error handling
app.use((error, req, res, next) => {
  console.error('Express error:', error);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

module.exports.handler = serverless(app);
