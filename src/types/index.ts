// Database-based Types
export interface Scene {
  Id: number;
  Name_EN: string;
  Name_DE: string;
  CameraStartX: number;
  CameraStartY: number;
  CameraStartZ: number;
}

export interface MeasurePoint {
  Id: number;
  Name_EN: string;
  Name_DE: string;
  SpacePosX: number;
  SpacePosY: number;
  SpacePosZ: number;
  Scene_Id: number;
  Position?: number; // for ordering in UI
  IsImportant?: boolean; // derived from requirements
}

export interface Product {
  Name: string;
  HTMLDescription_EN: string;
  HTMLDescription_DE: string;
  ImageUrl: string;
  Object3D_Url: string;
}

export interface ProductSpecification {
  Id: number;
  Product_Name: string;
  Title_EN: string;
  Title_DE: string;
  Value_EN: string;
  Value_DE: string;
  SortOrder: number;
}

export interface ProductFeature {
  Id: number;
  Product_Name: string;
  Feature_EN: string;
  Feature_DE: string;
  SortOrder: number;
}

export interface ProductAdvantage {
  Id: number;
  Product_Name: string;
  Advantage_EN: string;
  Advantage_DE: string;
  SortOrder: number;
}

export interface ProductInstallation {
  Id: number;
  Product_Name: string;
  InstallationInfo_EN: string;
  InstallationInfo_DE: string;
}

export interface ProductDatasheet {
  Id: number;
  Product_Name: string;
  FileUrl: string;
  DatasheetName_EN: string;
  DatasheetName_DE: string;
}

export interface ProductCategory {
  Id: number;
  Name_EN: string;
  Name_DE: string;
}

export interface MeasureParameter {
  Id: number;
  Name_EN: string;
  Name_DE: string;
}

// UI Types
export type LineType = 'cable' | 'tube' | 'fiber';

export interface LineTypeInfo {
  id: LineType;
  name: string;
  description: string;
  image: string;
  color: string;
}

export interface ConfiguratorState {
  // Basis
  selectedScene: Scene | null;
  selectedLineType: LineType | null;
  selectedMeasurePoint: string | null;
  selectedProduct: string | null;
  
  // Konfiguration
  configuration: Record<string, string>; // measurePointId -> productName
  
  // UI-State
  sidebarOpen: boolean;
  rightPanelOpen: boolean;
  view3DMode: 'line' | 'product';
  
  // Daten
  measurePoints: MeasurePoint[];
  products: Product[];
  loading: boolean;
  error?: string;
}

export interface ProductWithDetails extends Product {
  specifications: ProductSpecification[];
  features: ProductFeature[];
  advantages: ProductAdvantage[];
  installation?: ProductInstallation;
  datasheet?: ProductDatasheet;
  categories: ProductCategory[];
}

// 3D Scene Types
export interface StaticObject {
  id: string;
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface SceneData {
  scene: Scene;
  staticObjects: StaticObject[];
  measurePoints: MeasurePoint[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DatabaseService {
  // Szenen
  getScenes(): Promise<Scene[]>;
  getScene(id: number): Promise<Scene | null>;
  
  // Messpunkte
  getMeasurePoints(sceneId: number): Promise<MeasurePoint[]>;
  getMeasurePoint(id: number): Promise<MeasurePoint | null>;
  
  // Produkte
  getProducts(): Promise<Product[]>;
  getProduct(name: string): Promise<Product | null>;
  getProductWithDetails(name: string): Promise<ProductWithDetails | null>;
  
  // Produktdetails
  getProductSpecifications(productName: string): Promise<ProductSpecification[]>;
  getProductFeatures(productName: string): Promise<ProductFeature[]>;
  getProductAdvantages(productName: string): Promise<ProductAdvantage[]>;
  getProductInstallation(productName: string): Promise<ProductInstallation | null>;
  getProductDatasheet(productName: string): Promise<ProductDatasheet | null>;
  
  // Kategorien
  getProductCategories(): Promise<ProductCategory[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  
  // Messparameter
  getMeasureParameters(): Promise<MeasureParameter[]>;
  getMeasureParametersForMeasurePoint(measurePointId: number): Promise<MeasureParameter[]>;
  getProductsByMeasureParameter(measureParameterId: number): Promise<Product[]>;
} 