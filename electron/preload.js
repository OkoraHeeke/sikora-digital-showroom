const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Scenes
  getScenes: () => ipcRenderer.invoke('api-scenes-get-all'),
  getScene: (id) => ipcRenderer.invoke('api-scenes-get-by-id', id),
  getSceneComplete: (id) => ipcRenderer.invoke('api-scenes-get-complete', id),

  // Measure Points
  getMeasurePoints: () => ipcRenderer.invoke('api-measurepoints-get-all'),
  getMeasurePointsByScene: (sceneId) => ipcRenderer.invoke('api-measurepoints-get-by-scene', sceneId),
  getMeasurePoint: (id) => ipcRenderer.invoke('api-measurepoints-get-by-id', id),
  getMeasurePointProducts: (id) => ipcRenderer.invoke('api-measurepoints-get-products', id),
  getMeasurePointParameters: (id) => ipcRenderer.invoke('api-measurepoints-get-parameters', id),

  // Products
  getProducts: () => ipcRenderer.invoke('api-products-get-all'),
  getProduct: (name) => ipcRenderer.invoke('api-products-get-by-name', name),
  getProductSpecifications: (name) => ipcRenderer.invoke('api-products-get-specifications', name),
  getProductFeatures: (name) => ipcRenderer.invoke('api-products-get-features', name),
  getProductAdvantages: (name) => ipcRenderer.invoke('api-products-get-advantages', name),
  getProductInstallation: (name) => ipcRenderer.invoke('api-products-get-installation', name),
  getProductDatasheet: (name) => ipcRenderer.invoke('api-products-get-datasheet', name),

  // Categories
  getCategories: () => ipcRenderer.invoke('api-categories-get-all'),
  getCategoryProducts: (id) => ipcRenderer.invoke('api-categories-get-products', id),

  // Measure Parameters
  getMeasureParameters: () => ipcRenderer.invoke('api-measureparameters-get-all'),
  getMeasureParameterProducts: (id) => ipcRenderer.invoke('api-measureparameters-get-products', id),

  // Health Check
  healthCheck: () => ipcRenderer.invoke('api-health'),

  // Utility
  isElectron: true,
  platform: process.platform
});
