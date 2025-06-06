const { ipcMain } = require('electron');
const { queryAll, queryGet, queryRun } = require('./database');

// Helper function for API responses
const sendResponse = (success, data, error = null) => {
  if (error) {
    console.error('IPC Error:', error);
    return { success: false, error: error.message };
  } else {
    return { success: true, data };
  }
};

// Initialize IPC handlers
function setupIpcHandlers() {

  // === SZENEN ===
  ipcMain.handle('api-scenes-get-all', async () => {
    try {
      const scenes = queryAll('SELECT * FROM Scene ORDER BY Id');
      return sendResponse(true, scenes);
    } catch (error) {
      return sendResponse(false, null, error);
    }
  });

  ipcMain.handle('api-scenes-get-by-id', async (event, id) => {
    try {
      const scene = queryGet('SELECT * FROM Scene WHERE Id = ?', [id]);
      return sendResponse(true, scene);
    } catch (error) {
      return sendResponse(false, null, error);
    }
  });

  // === MESSPUNKTE ===
  ipcMain.handle('api-measurepoints-get-all', async () => {
    try {
      const measurePoints = queryAll(`
        SELECT mp.*, s.Name_EN as Scene_Name_EN, s.Name_DE as Scene_Name_DE
        FROM MeasurePoint mp
        LEFT JOIN Scene s ON mp.Scene_Id = s.Id
        ORDER BY mp.Id
      `);
      return sendResponse(true, measurePoints);
    } catch (error) {
      return sendResponse(false, null, error);
    }
  });

  ipcMain.handle('api-measurepoints-get-by-scene', async (event, sceneId) => {
    try {
      const measurePoints = queryAll(
        'SELECT * FROM MeasurePoint WHERE Scene_Id = ? ORDER BY Id',
        [sceneId]
      );
      return sendResponse(true, measurePoints);
    } catch (error) {
      return sendResponse(false, null, error);
    }
  });

  ipcMain.handle('api-measurepoints-get-by-id', async (event, id) => {
    try {
      const measurePoint = queryGet('SELECT * FROM MeasurePoint WHERE Id = ?', [id]);
      return sendResponse(true, measurePoint);
    } catch (error) {
      return sendResponse(false, null, error);
    }
  });

  // === PRODUKTE ===
  ipcMain.handle('api-products-get-all', async () => {
    try {
      const products = queryAll('SELECT * FROM Product ORDER BY Name');
      return sendResponse(true, products);
    } catch (error) {
      return sendResponse(false, null, error);
    }
  });

  ipcMain.handle('api-products-get-by-name', async (event, name) => {
    try {
      const product = queryGet('SELECT * FROM Product WHERE Name = ?', [decodeURIComponent(name)]);
      return sendResponse(true, product);
    } catch (error) {
      return sendResponse(false, null, error);
    }
  });

  // === PRODUKTDETAILS ===
  ipcMain.handle('api-products-get-specifications', async (event, name) => {
    try {
      const specifications = queryAll(`
        SELECT * FROM ProductSpecification
        WHERE Product_Name = ?
        ORDER BY SortOrder, Id
      `, [decodeURIComponent(name)]);
      return sendResponse(true, specifications);
    } catch (error) {
      return sendResponse(false, null, error);
    }
  });

  ipcMain.handle('api-products-get-features', async (event, name) => {
    try {
      const features = queryAll(`
        SELECT * FROM ProductFeature
        WHERE Product_Name = ?
        ORDER BY SortOrder, Id
      `, [decodeURIComponent(name)]);
      return sendResponse(true, features);
    } catch (error) {
      return sendResponse(false, null, error);
    }
  });

  ipcMain.handle('api-products-get-advantages', async (event, name) => {
    try {
      const advantages = queryAll(`
        SELECT * FROM ProductAdvantage
        WHERE Product_Name = ?
        ORDER BY SortOrder, Id
      `, [decodeURIComponent(name)]);
      return sendResponse(true, advantages);
    } catch (error) {
      return sendResponse(false, null, error);
    }
  });

  ipcMain.handle('api-products-get-installation', async (event, name) => {
    try {
      const installation = queryGet(`
        SELECT * FROM ProductInstallation
        WHERE Product_Name = ?
        LIMIT 1
      `, [decodeURIComponent(name)]);
      return sendResponse(true, installation);
    } catch (error) {
      return sendResponse(false, null, error);
    }
  });

  ipcMain.handle('api-products-get-datasheet', async (event, name) => {
    try {
      const datasheet = queryGet(`
        SELECT * FROM ProductDatasheet
        WHERE Product_Name = ?
        LIMIT 1
      `, [decodeURIComponent(name)]);
      return sendResponse(true, datasheet);
    } catch (error) {
      return sendResponse(false, null, error);
    }
  });

  // === KATEGORIEN ===
  ipcMain.handle('api-categories-get-all', async () => {
    try {
      const categories = queryAll('SELECT * FROM ProductCategory ORDER BY Id');
      return sendResponse(true, categories);
    } catch (error) {
      return sendResponse(false, null, error);
    }
  });

  ipcMain.handle('api-categories-get-products', async (event, id) => {
    try {
      const products = queryAll(`
        SELECT p.* FROM Product p
        JOIN Join_Product_Category jpc ON p.Name = jpc.Product_Name
        WHERE jpc.Category_Id = ?
        ORDER BY p.Name
      `, [id]);
      return sendResponse(true, products);
    } catch (error) {
      return sendResponse(false, null, error);
    }
  });

  // === MESSPARAMETER ===
  ipcMain.handle('api-measureparameters-get-all', async () => {
    try {
      const parameters = queryAll('SELECT * FROM MeasureParameter ORDER BY Id');
      return sendResponse(true, parameters);
    } catch (error) {
      return sendResponse(false, null, error);
    }
  });

  ipcMain.handle('api-measurepoints-get-parameters', async (event, id) => {
    try {
      const parameters = queryAll(`
        SELECT mp.* FROM MeasureParameter mp
        JOIN Join_MeasurePoint_MeasureParameter jmpm ON mp.Id = jmpm.MeasureParameter_Id
        WHERE jmpm.MeasurePoint_Id = ?
        ORDER BY mp.Id
      `, [id]);
      return sendResponse(true, parameters);
    } catch (error) {
      return sendResponse(false, null, error);
    }
  });

  ipcMain.handle('api-measureparameters-get-products', async (event, id) => {
    try {
      const products = queryAll(`
        SELECT p.* FROM Product p
        JOIN Join_Product_MeasureParameter jpmp ON p.Name = jpmp.Product_Name
        WHERE jpmp.MeasureParameter_Id = ?
        ORDER BY p.Name
      `, [id]);
      return sendResponse(true, products);
    } catch (error) {
      return sendResponse(false, null, error);
    }
  });

  // === PRODUKTE FÜR MESSPUNKTE ===
  ipcMain.handle('api-measurepoints-get-products', async (event, id) => {
    try {
      // Erst prüfen ob Messpunkt existiert
      const measurePointExists = queryGet('SELECT Id, Scene_Id FROM MeasurePoint WHERE Id = ?', [id]);
      if (!measurePointExists) {
        return sendResponse(true, []);
      }

      const measurePoint = measurePointExists;

      // Versuche zuerst Produkte über Messparameter zu finden
      let products = queryAll(`
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
        products = queryAll(`
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
        products = queryAll(`
          SELECT * FROM Product
          WHERE Name NOT IN (
            SELECT COALESCE(amp.Product_Name, '') FROM AntiJoin_MeasurePoint_Product amp
            WHERE amp.MeasurePoint_Id = ?
          )
          ORDER BY Name
          LIMIT 50
        `, [id]);
      }

      return sendResponse(true, products);
    } catch (error) {
      return sendResponse(false, null, error);
    }
  });

  // === VOLLSTÄNDIGE SZENEN ===
  ipcMain.handle('api-scenes-get-complete', async (event, id) => {
    try {
      const scene = queryGet('SELECT * FROM Scene WHERE Id = ?', [id]);
      const measurePoints = queryAll('SELECT * FROM MeasurePoint WHERE Scene_Id = ? ORDER BY Id', [id]);

      if (!scene) {
        return sendResponse(false, null, new Error('Scene not found'));
      }

      // Prüfe ob die Tabelle Map_Scene_Object3D_Static_Placement existiert und Spalten hat
      let staticObjects = [];
      try {
        staticObjects = queryAll(`
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

      return sendResponse(true, sceneData);
    } catch (error) {
      return sendResponse(false, null, error);
    }
  });

  // === HEALTH CHECK ===
  ipcMain.handle('api-health', async () => {
    return sendResponse(true, { status: 'OK', timestamp: new Date().toISOString() });
  });

  console.log('IPC handlers initialized');
}

module.exports = { setupIpcHandlers };
