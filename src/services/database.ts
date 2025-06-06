import type {
  Scene,
  MeasurePoint,
  Product,
  ProductWithDetails,
  ProductSpecification,
  ProductFeature,
  ProductAdvantage,
  ProductInstallation,
  ProductDatasheet,
  ProductCategory,
  MeasureParameter,
  ApiResponse,
  DatabaseService,
} from '../types';

class SikoraDatabaseService implements DatabaseService {
  private baseUrl: string;

  constructor() {
    // Environment detection for different deployment scenarios
    if (typeof window !== 'undefined') {
      // Browser environment
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Development: Use Vite proxy
        this.baseUrl = '/api';
      } else if (window.location.hostname.includes('.netlify.app') || window.location.hostname.includes('.netlify.com')) {
        // Netlify deployment: Use Netlify Functions
        this.baseUrl = '/.netlify/functions/api';
      } else {
        // Other production environments: Check for backend availability
        this.baseUrl = '/api';
      }
    } else {
      // Server-side rendering fallback
      this.baseUrl = '/api';
    }

    console.log(`🔗 SIKORA API Base URL: ${this.baseUrl}`);
  }

  private async fetchApi<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }

      return result.data as T;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Szenen
  async getScenes(): Promise<Scene[]> {
    return this.fetchApi<Scene[]>('/scenes');
  }

  async getScene(id: number): Promise<Scene | null> {
    try {
      return await this.fetchApi<Scene>(`/scenes/${id}`);
    } catch (error) {
      console.error(`Scene ${id} not found:`, error);
      return null;
    }
  }

  // Messpunkte
  async getMeasurePoints(sceneId: number): Promise<MeasurePoint[]> {
    return this.fetchApi<MeasurePoint[]>(`/scenes/${sceneId}/measurepoints`);
  }

  async getMeasurePoint(id: number): Promise<MeasurePoint | null> {
    try {
      return await this.fetchApi<MeasurePoint>(`/measurepoints/${id}`);
    } catch (error) {
      console.error(`MeasurePoint ${id} not found:`, error);
      return null;
    }
  }

  // Produkte
  async getProducts(): Promise<Product[]> {
    return this.fetchApi<Product[]>('/products');
  }

  async getProduct(name: string): Promise<Product | null> {
    try {
      return await this.fetchApi<Product>(`/products/${encodeURIComponent(name)}`);
    } catch (error) {
      console.error(`Product ${name} not found:`, error);
      return null;
    }
  }

  async getProductWithDetails(name: string): Promise<ProductWithDetails | null> {
    try {
      const product = await this.getProduct(name);
      if (!product) return null;

      const [specifications, features, advantages, installation, datasheet, categories] = await Promise.all([
        this.getProductSpecifications(name),
        this.getProductFeatures(name),
        this.getProductAdvantages(name),
        this.getProductInstallation(name),
        this.getProductDatasheet(name),
        this.getProductCategories(), // TODO: Filter by product
      ]);

      return {
        ...product,
        specifications,
        features,
        advantages,
        installation: installation || undefined,
        datasheet: datasheet || undefined,
        categories, // TODO: Filter categories by product
      };
    } catch (error) {
      console.error(`Product details for ${name} not found:`, error);
      return null;
    }
  }

  // Produktdetails
  async getProductSpecifications(productName: string): Promise<ProductSpecification[]> {
    return this.fetchApi<ProductSpecification[]>(`/products/${encodeURIComponent(productName)}/specifications`);
  }

  async getProductFeatures(productName: string): Promise<ProductFeature[]> {
    return this.fetchApi<ProductFeature[]>(`/products/${encodeURIComponent(productName)}/features`);
  }

  async getProductAdvantages(productName: string): Promise<ProductAdvantage[]> {
    return this.fetchApi<ProductAdvantage[]>(`/products/${encodeURIComponent(productName)}/advantages`);
  }

  async getProductInstallation(productName: string): Promise<ProductInstallation | null> {
    try {
      return await this.fetchApi<ProductInstallation>(`/products/${encodeURIComponent(productName)}/installation`);
    } catch (error) {
      console.error(`Installation info for ${productName} not found:`, error);
      return null;
    }
  }

  async getProductDatasheet(productName: string): Promise<ProductDatasheet | null> {
    try {
      return await this.fetchApi<ProductDatasheet>(`/products/${encodeURIComponent(productName)}/datasheet`);
    } catch (error) {
      console.error(`Datasheet for ${productName} not found:`, error);
      return null;
    }
  }

  // Kategorien
  async getProductCategories(): Promise<ProductCategory[]> {
    return this.fetchApi<ProductCategory[]>('/categories');
  }

  async getProductCategoriesForProduct(productName: string): Promise<ProductCategory[]> {
    return this.fetchApi<ProductCategory[]>(`/products/${encodeURIComponent(productName)}/categories`);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return this.fetchApi<Product[]>(`/categories/${categoryId}/products`);
  }

  // Messparameter
  async getMeasureParameters(): Promise<MeasureParameter[]> {
    return this.fetchApi<MeasureParameter[]>('/measureparameters');
  }

  async getMeasureParametersForMeasurePoint(measurePointId: number): Promise<MeasureParameter[]> {
    return this.fetchApi<MeasureParameter[]>(`/measurepoints/${measurePointId}/parameters`);
  }

  async getProductsByMeasureParameter(measureParameterId: number): Promise<Product[]> {
    return this.fetchApi<Product[]>(`/measureparameters/${measureParameterId}/products`);
  }

  // Filtered Products für Messpunkte
  async getProductsForMeasurePoint(measurePointId: number): Promise<Product[]> {
    return this.fetchApi<Product[]>(`/measurepoints/${measurePointId}/products`);
  }

  // Scene Data für 3D-Rendering - mit statischen Objekten
  async getSceneData(sceneId: number): Promise<{ scene: Scene; measurePoints: MeasurePoint[]; staticObjects: any[] }> {
    try {
      const sceneData = await this.fetchApi<any>(`/scenes/${sceneId}/complete`);
      return sceneData;
    } catch (error) {
      // Fallback: Separate API calls
      const [scene, measurePoints] = await Promise.all([
        this.getScene(sceneId),
        this.getMeasurePoints(sceneId),
      ]);

      if (!scene) {
        throw new Error(`Scene ${sceneId} not found`);
      }

      return { scene, measurePoints, staticObjects: [] };
    }
  }
}

// Singleton instance
export const databaseService = new SikoraDatabaseService();

// Hilfsfunktionen für Entwicklung
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/health');
    return response.ok;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

// Produktnamen korrekt formatieren (GROSSBUCHSTABEN)
export const formatSikoraProductName = (name: string): string => {
  return name.toUpperCase();
};

// Scene ID Mapping für Linientypen
export const getSceneIdForLineType = (lineType: 'cable' | 'tube' | 'fiber'): number => {
  // Basierend auf der Datenbank: nur Scene ID 1 existiert
  return 1; // Wire & Cable CV Line
};

// Placeholder für Mock-Daten (nur für Fallback)
export const createFallbackData = () => {
  return {
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
        SpacePosX: -12.3074787453994,
        SpacePosY: 0.0,
        SpacePosZ: 0.0,
        Scene_Id: 1,
        Position: 1,
      },
      {
        Id: 2,
        Name_EN: 'Extrusion Zone',
        Name_DE: 'Extrusionszone',
        SpacePosX: -0.0289708210139386,
        SpacePosY: 0.0,
        SpacePosZ: 0.0,
        Scene_Id: 1,
        Position: 2,
      },
      {
        Id: 3,
        Name_EN: 'Cooling Zone',
        Name_DE: 'Kühlzone',
        SpacePosX: 13.6278490392243,
        SpacePosY: 0.0,
        SpacePosZ: 0.0,
        Scene_Id: 1,
        Position: 3,
      },
      {
        Id: 4,
        Name_EN: 'Cooling',
        Name_DE: 'Kühlung',
        SpacePosX: 4.853,
        SpacePosY: 1.0,
        SpacePosZ: 0.0,
        Scene_Id: 1,
        Position: 4,
      }
    ]
  };
};
