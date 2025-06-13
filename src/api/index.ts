// API Wrapper that works in both browser and Electron environments

interface ElectronAPI {
  // Scenes
  getScenes: () => Promise<any>;
  getScene: (id: string | number) => Promise<any>;
  getSceneComplete: (id: string | number) => Promise<any>;

  // Measure Points
  getMeasurePoints: () => Promise<any>;
  getMeasurePointsByScene: (sceneId: string | number) => Promise<any>;
  getMeasurePoint: (id: string | number) => Promise<any>;
  getMeasurePointProducts: (id: string | number) => Promise<any>;
  getMeasurePointParameters: (id: string | number) => Promise<any>;

  // Products
  getProducts: () => Promise<any>;
  getProduct: (name: string) => Promise<any>;
  getProductSpecifications: (name: string) => Promise<any>;
  getProductFeatures: (name: string) => Promise<any>;
  getProductAdvantages: (name: string) => Promise<any>;
  getProductInstallation: (name: string) => Promise<any>;
  getProductDatasheet: (name: string) => Promise<any>;

  // Categories
  getCategories: () => Promise<any>;
  getCategoryProducts: (id: string | number) => Promise<any>;

  // Measure Parameters
  getMeasureParameters: () => Promise<any>;
  getMeasureParameterProducts: (id: string | number) => Promise<any>;

  // Health Check
  healthCheck: () => Promise<any>;

  // Utility
  isElectron: boolean;
  platform: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

// Check if we're running in Electron
const isElectron = window.electronAPI?.isElectron || false;
// Use relative URLs in browser to work with Vite proxy, absolute URLs in Electron
const API_BASE_URL = isElectron ? 'http://localhost:3001/api' : '/api';

// Generic HTTP fetch function
async function fetchAPI(endpoint: string, options?: RequestInit): Promise<any> {
  try {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`API Request: ${fullUrl}`); // Debug log
    const response = await fetch(fullUrl, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`HTTP API Error for ${endpoint}:`, error);
    throw error;
  }
}

// API wrapper that routes to either Electron IPC or HTTP
export const api = {
  // Scenes
  async getScenes() {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.getScenes();
    }
    return fetchAPI('/scenes');
  },

  async getScene(id: string | number) {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.getScene(id);
    }
    return fetchAPI(`/scenes/${id}`);
  },

  async getSceneComplete(id: string | number) {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.getSceneComplete(id);
    }
    return fetchAPI(`/scenes/${id}/complete`);
  },

  // Measure Points
  async getMeasurePoints() {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.getMeasurePoints();
    }
    return fetchAPI('/measurepoints');
  },

  async getMeasurePointsByScene(sceneId: string | number) {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.getMeasurePointsByScene(sceneId);
    }
    return fetchAPI(`/scenes/${sceneId}/measurepoints`);
  },

  async getMeasurePoint(id: string | number) {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.getMeasurePoint(id);
    }
    return fetchAPI(`/measurepoints/${id}`);
  },

  async getMeasurePointProducts(id: string | number) {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.getMeasurePointProducts(id);
    }
    return fetchAPI(`/measurepoints/${id}/products`);
  },

  // Get only directly assigned products for a measure point (not fallback products)
  async getMeasurePointAssignedProducts(id: string | number) {
    return fetchAPI(`/measurepoints/${id}/assigned-products`);
  },

  async getMeasurePointParameters(id: string | number) {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.getMeasurePointParameters(id);
    }
    return fetchAPI(`/measurepoints/${id}/parameters`);
  },

  // Assign products to measure point
  async assignProductsToMeasurePoint(measurePointId: string | number, productNames: string[]) {
    return fetchAPI(`/measurepoints/${measurePointId}/assign-products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productNames }),
    });
  },

  // Unassign product from measure point
  async unassignProductFromMeasurePoint(measurePointId: string | number, productName: string) {
    return fetchAPI(`/measurepoints/${measurePointId}/unassign-product/${encodeURIComponent(productName)}`, {
      method: 'DELETE',
    });
  },

  // Products
  async getProducts() {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.getProducts();
    }
    return fetchAPI('/products');
  },

  async getProduct(name: string) {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.getProduct(name);
    }
    return fetchAPI(`/products/${encodeURIComponent(name)}`);
  },

  // Create product
  async createProduct(productData: any) {
    return fetchAPI('/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
  },

  // Update product
  async updateProduct(name: string, productData: any) {
    return fetchAPI(`/products/${encodeURIComponent(name)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
  },

  // Delete product
  async deleteProduct(name: string) {
    console.log(`Deleting product: ${name}`); // Debug log
    return fetchAPI(`/products/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
  },

  async getProductSpecifications(name: string) {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.getProductSpecifications(name);
    }
    return fetchAPI(`/products/${encodeURIComponent(name)}/specifications`);
  },

  async getProductFeatures(name: string) {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.getProductFeatures(name);
    }
    return fetchAPI(`/products/${encodeURIComponent(name)}/features`);
  },

  async getProductAdvantages(name: string) {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.getProductAdvantages(name);
    }
    return fetchAPI(`/products/${encodeURIComponent(name)}/advantages`);
  },

  async getProductInstallation(name: string) {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.getProductInstallation(name);
    }
    return fetchAPI(`/products/${encodeURIComponent(name)}/installation`);
  },

  async getProductDatasheet(name: string) {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.getProductDatasheet(name);
    }
    return fetchAPI(`/products/${encodeURIComponent(name)}/datasheet`);
  },

  // Categories
  async getCategories() {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.getCategories();
    }
    return fetchAPI('/categories');
  },

  async getCategoryProducts(id: string | number) {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.getCategoryProducts(id);
    }
    return fetchAPI(`/categories/${id}/products`);
  },

  // Measure Parameters
  async getMeasureParameters() {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.getMeasureParameters();
    }
    return fetchAPI('/measureparameters');
  },

  async getMeasureParameterProducts(id: string | number) {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.getMeasureParameterProducts(id);
    }
    return fetchAPI(`/measureparameters/${id}/products`);
  },

  // Health Check
  async healthCheck() {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.healthCheck();
    }
    return fetchAPI('/health');
  },

  // Utility functions
  isElectron: () => isElectron,
  getAssetUrl: (path: string) => {
    // In Electron, assets are served via file protocol or can be accessed directly
    // In browser, assets are served via HTTP
    if (isElectron) {
      // For Electron, we might need to adjust the path based on the build setup
      return path.startsWith('/') ? path : `/${path}`;
    } else {
      // For browser, use the API server for assets
      return `${API_BASE_URL}/assets/${path}`;
    }
  }
};

// Export for debugging
export const debugAPI = {
  isElectron,
  hasElectronAPI: !!window.electronAPI,
  apiBaseUrl: API_BASE_URL
};
