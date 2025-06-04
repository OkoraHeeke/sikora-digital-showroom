/**
 * 3D-Modell-URL-Updater für SIKORA Digital Showroom
 * Aktualisiert die Object3D_Url in der Datenbank um auf echte GLB-Dateien zu zeigen
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

const dbPath = path.join(__dirname, 'DB', 'database.sqlite');
const modelsPath = path.join(__dirname, 'assets', 'models');

console.log('🔧 SIKORA 3D-Modell URL Updater');
console.log('================================\n');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Fehler beim Öffnen der Datenbank:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Datenbank-Verbindung erfolgreich\n');
    updateModelUrls();
  }
});

async function scanAvailableModels() {
  console.log('📋 Scanne verfügbare 3D-Modelle...');

  const scanDirectory = async (dir, basePath = '') => {
    const models = [];
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(basePath, entry.name);

        if (entry.isDirectory()) {
          const subModels = await scanDirectory(fullPath, relativePath);
          models.push(...subModels);
        } else if (entry.name.endsWith('.glb') || entry.name.endsWith('.gltf')) {
          models.push({
            filename: entry.name,
            path: relativePath.replace(/\\/g, '/'),
            url: `models/${relativePath.replace(/\\/g, '/')}`
          });
        }
      }
    } catch (error) {
      console.error(`Fehler beim Scannen von ${dir}:`, error);
    }

    return models;
  };

  try {
    const models = await scanDirectory(modelsPath);
    console.log(`✅ ${models.length} 3D-Modelle gefunden\n`);
    return models;
  } catch (error) {
    console.error('❌ Fehler beim Scannen der Modelle:', error);
    return [];
  }
}

function createProductModelMapping(availableModels) {
  console.log('🔗 Erstelle Produkt-zu-Modell-Mapping...');

  const mapping = {};

  // Mapping-Regeln basierend auf Produktnamen
  const mappingRules = [
    // X-RAY Serie
    { pattern: /^X-RAY 6020 PRO/, models: ['x_ray_6000/x-ray_6020_pro.glb'] },
    { pattern: /^X-RAY 6035 PRO/, models: ['x_ray_6000/x-ray_6035_pro.glb'] },
    { pattern: /^X-RAY 6070 PRO/, models: ['x_ray_6000/x-ray_6070_pro.glb'] },
    { pattern: /^X-RAY 6120 PRO/, models: ['x_ray_6000/x-ray_6120_pro.glb'] },
    { pattern: /^X-RAY 6200 PRO/, models: ['x_ray_6000/x-ray_6200_pro.glb'] },
    { pattern: /^X-RAY 6300 PRO/, models: ['x_ray_6000/x-ray_6300_pro.glb'] },
    { pattern: /^X-RAY 8000 ADVANCED/, models: ['x_ray_8000/x-ray_8000_advanced_ccv.glb'] },
    { pattern: /^X-RAY 8000 NXT/, models: ['x_ray_8000/x-ray_8000_nxt_ccv.glb'] },
    { pattern: /^X-RAY 8700 NXT/, models: ['x_ray_8000/x-ray_8700_nxt_ccv.glb'] },

    // LASER Serie
    { pattern: /^LASER 2005 XY/, models: ['laser_series_2000/laser_2005_xy.glb'] },
    { pattern: /^LASER 2010 XY/, models: ['laser_series_2000/laser_2010_xy.glb'] },
    { pattern: /^LASER 2010 T/, models: ['laser_series_2000/laser_2010_t.glb'] },
    { pattern: /^LASER 2025 T/, models: ['laser_series_2000/laser_2025_t.glb'] },
    { pattern: /^LASER 2030 XY/, models: ['laser_series_2000/laser_2030_xy.glb'] },
    { pattern: /^LASER 2030 F\/R/, models: ['laser_series_2000/laser_2030_fr.glb'] },
    { pattern: /^LASER 2050 XY/, models: ['laser_series_2000/laser_2050_xy.glb'] },
    { pattern: /^LASER 2050 T/, models: ['laser_series_2000/laser_2050_t.glb'] },
    { pattern: /^LASER 2050 S\/R/, models: ['laser_series_2000/laser_2050_sr.glb'] },
    { pattern: /^LASER 2100 XY/, models: ['laser_series_2000/laser_2100_xy.glb'] },
    { pattern: /^LASER 2100 T/, models: ['laser_series_2000/laser_2100_t.glb'] },
    { pattern: /^LASER 2100 S\/R/, models: ['laser_series_2000/laser_2100_sr.glb'] },
    { pattern: /^LASER 2200 XY/, models: ['laser_series_2000/laser_2200_xy.glb'] },
    { pattern: /^LASER 2300 XY/, models: ['laser_series_2000/laser_2300_xy.glb'] },

    // LASER PRO Serie
    { pattern: /^LASER PRO 13 XY/, models: ['laser_pro/laser_pro_13_xy.glb'] },
    { pattern: /^LASER PRO 32 XY/, models: ['laser_pro/laser_pro_32_xy.glb'] },
    { pattern: /^LASER PRO 51 XY/, models: ['laser_pro/laser_pro_51_xy.glb'] },

    // CENTERWAVE Serie
    { pattern: /^CENTERWAVE 6000\/250/, models: ['centerwave_6000/centerwave_6000_250.glb'] },
    { pattern: /^CENTERWAVE 6000\/400/, models: ['centerwave_6000/centerwave_6000_400.glb'] },
    { pattern: /^CENTERWAVE 6000\/630/, models: ['centerwave_6000/centerwave_6000_630.glb'] },
    { pattern: /^CENTERWAVE 6000\/800/, models: ['centerwave_6000/centerwave_6000_800.glb'] },
    { pattern: /^CENTERWAVE 6000\/1200/, models: ['centerwave_6000/centerwave_6000_1200.glb'] },
    { pattern: /^CENTERWAVE 6000\/1600/, models: ['centerwave_6000/centerwave_6000_1600.glb'] },

    // CENTERVIEW Serie
    { pattern: /^CENTERVIEW 8010$/, models: ['centerview_8000/centerview_8010.glb'] },
    { pattern: /^CENTERVIEW 8010e$/, models: ['centerview_8000/centerview_8010e.glb'] },
    { pattern: /^CENTERVIEW 8025$/, models: ['centerview_8000/centerview_8025.glb'] },
    { pattern: /^CENTERVIEW 8025e$/, models: ['centerview_8000/centerview_8025e.glb'] },
    { pattern: /^CENTERVIEW PRO 10$/, models: ['centerview_pro/centerview_pro_10.glb'] },
    { pattern: /^CENTERVIEW PRO 10e$/, models: ['centerview_pro/centerview_pro_10e.glb'] },
    { pattern: /^CENTERVIEW PRO 25$/, models: ['centerview_pro/centerview_pro_25.glb'] },
    { pattern: /^CENTERVIEW PRO 25e$/, models: ['centerview_pro/centerview_pro_25e.glb'] },

    // SPARK Serie
    { pattern: /^SPARK 2030 UL/, models: ['spark_2000_6000/spark_2030_ul.glb'] },
    { pattern: /^SPARK 2060 BS/, models: ['spark_2000_6000/spark_2060_bs.glb'] },
    { pattern: /^SPARK 2200 BS/, models: ['spark_2000_6000/spark_2200_bs.glb'] },
    { pattern: /^SPARK 6020 DC/, models: ['spark_2000_6000/spark_6020_dc.glb'] },
    { pattern: /^SPARK 6030 HF/, models: ['spark_2000_6000/spark_6030_hf.glb'] },

    // LUMP Serie
    { pattern: /^LUMP 2010 XY/, models: ['lump_2000/lump_2010_xy.glb'] },
    { pattern: /^LUMP 2010 T/, models: ['lump_2000/lump_2010_t.glb'] },
    { pattern: /^LUMP 2025 XY/, models: ['lump_2000/lump_2025_xy.glb'] },
    { pattern: /^LUMP 2035 T/, models: ['lump_2000/lump_2035_t.glb'] },

    // CAPACITANCE Serie
    { pattern: /^CAPACITANCE 2010/, models: ['capacitance/capacitance_2010.glb'] },
    { pattern: /^CAPACITANCE 2025/, models: ['capacitance/capacitance_2025.glb'] },
    { pattern: /^CAPACITANCE 2060/, models: ['capacitance/capacitance_2060.glb'] },

    // PREHEATER Serie
    { pattern: /^PREHEATER 6000 TC$/, models: ['preheater_6000_tc/preheater_6000_tc_10kw.glb'] },
    { pattern: /^PREHEATER 6000 TC 10KW/, models: ['preheater_6000_tc/preheater_6000_tc_10kw.glb'] },
    { pattern: /^PREHEATER 6000 TC 15KW/, models: ['preheater_6000_tc/preheater_6000_tc_15kw.glb'] },
    { pattern: /^PREHEATER 6000 TC 20KW/, models: ['preheater_6000_tc/preheater_6000_tc_20kw.glb'] },
    { pattern: /^PREHEATER 6000 TC 25KW/, models: ['preheater_6000_tc/preheater_6000_tc_25kw.glb'] },
    { pattern: /^PREHEATER 6000 TC 30KW/, models: ['preheater_6000_tc/preheater_6000_tc_30kw.glb'] },
    { pattern: /^PREHEATER 6000 TC 35KW/, models: ['preheater_6000_tc/preheater_6000_tc_35kw.glb'] },
    { pattern: /^PREHEATER 6030 TC/, models: ['preheater_6000_tc/PREHEATER_6030_TC.glb'] },

    // ECOCONTROL Serie
    { pattern: /^ECOCONTROL 600/, models: ['ecocontrol/ecocontrol_600.glb'] },
    { pattern: /^ECOCONTROL 1000/, models: ['ecocontrol/ecocontrol_1000.glb'] },
    { pattern: /^ECOCONTROL 6000/, models: ['ecocontrol/ecocontrol_6000.glb'] },

    // PURITY Serie
    { pattern: /^PURITY CONCEPT V/, models: ['purity_concept/purity_concept_v.glb'] },
    { pattern: /^PURITY CONCEPT X/, models: ['purity_concept/purity_concept_x.glb'] },

    // REMOTE Serie
    { pattern: /^REMOTE 6000/, models: ['remote_6000/remote_6000.glb'] },
  ];

  // Erstelle Mapping für jede Regel
  for (const rule of mappingRules) {
    for (const modelPath of rule.models) {
      const modelExists = availableModels.some(m => m.path === modelPath);
      if (modelExists) {
        if (!mapping[rule.pattern]) {
          mapping[rule.pattern] = modelPath;
        }
      }
    }
  }

  console.log(`✅ ${Object.keys(mapping).length} Mapping-Regeln erstellt\n`);
  return mapping;
}

async function updateModelUrls() {
  try {
    // 1. Scanne verfügbare Modelle
    const availableModels = await scanAvailableModels();

    // 2. Erstelle Produkt-zu-Modell-Mapping
    const productMapping = createProductModelMapping(availableModels);

    // 3. Lade alle Produkte aus der Datenbank
    console.log('📥 Lade Produkte aus der Datenbank...');
    const products = await new Promise((resolve, reject) => {
      db.all('SELECT Name, Object3D_Url FROM Product ORDER BY Name', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`✅ ${products.length} Produkte geladen\n`);

    // 4. Aktualisiere URLs
    console.log('🔄 Aktualisiere 3D-Modell-URLs...');
    let updatedCount = 0;
    let matchedCount = 0;

    for (const product of products) {
      let newUrl = null;

      // Suche passende Mapping-Regel
      for (const [pattern, modelPath] of Object.entries(productMapping)) {
        if (pattern.test(product.Name)) {
          newUrl = `models/${modelPath}`;
          matchedCount++;
          break;
        }
      }

      // Aktualisiere nur wenn neue URL gefunden wurde und sich unterscheidet
      if (newUrl && newUrl !== product.Object3D_Url) {
        await new Promise((resolve, reject) => {
          db.run(
            'UPDATE Product SET Object3D_Url = ? WHERE Name = ?',
            [newUrl, product.Name],
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });

        console.log(`  ✅ ${product.Name}: ${newUrl}`);
        updatedCount++;
      } else if (newUrl) {
        console.log(`  ⏭️ ${product.Name}: bereits korrekt`);
      } else {
        console.log(`  ⚠️ ${product.Name}: kein passendes Modell gefunden`);
      }
    }

    console.log('\n📊 Zusammenfassung:');
    console.log(`  • Produkte insgesamt: ${products.length}`);
    console.log(`  • Modelle zugeordnet: ${matchedCount}`);
    console.log(`  • URLs aktualisiert: ${updatedCount}`);
    console.log(`  • Verfügbare Modelle: ${availableModels.length}`);

    console.log('\n✅ 3D-Modell-URL-Update abgeschlossen!');
    console.log('💡 Teste die Modelle mit: GET /api/debug/models/status');

  } catch (error) {
    console.error('❌ Fehler beim Update:', error);
  } finally {
    db.close();
  }
}
