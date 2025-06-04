-- SQLite database schema for product import

-- 3D Objects table
CREATE TABLE IF NOT EXISTS Object3D (
    Url TEXT PRIMARY KEY
);

-- Products table
CREATE TABLE IF NOT EXISTS Product (
    Name TEXT PRIMARY KEY,
    HTMLDescription_EN TEXT,
    HTMLDescription_DE TEXT,
    ImageUrl TEXT,
    Object3D_Url TEXT,
    FOREIGN KEY (Object3D_Url) REFERENCES Object3D(Url)
);

-- Product Specifications
CREATE TABLE IF NOT EXISTS ProductSpecification (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Product_Name TEXT,
    Title_EN TEXT,
    Title_DE TEXT,
    Value_EN TEXT,
    Value_DE TEXT,
    SortOrder INTEGER,
    FOREIGN KEY (Product_Name) REFERENCES Product(Name)
);

-- Product Features
CREATE TABLE IF NOT EXISTS ProductFeature (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Product_Name TEXT,
    Feature_EN TEXT,
    Feature_DE TEXT,
    SortOrder INTEGER,
    FOREIGN KEY (Product_Name) REFERENCES Product(Name)
);

-- Product Advantages
CREATE TABLE IF NOT EXISTS ProductAdvantage (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Product_Name TEXT,
    Advantage_EN TEXT,
    Advantage_DE TEXT,
    SortOrder INTEGER,
    FOREIGN KEY (Product_Name) REFERENCES Product(Name)
);

-- Product Installation Information
CREATE TABLE IF NOT EXISTS ProductInstallation (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Product_Name TEXT UNIQUE,
    InstallationInfo_EN TEXT,
    InstallationInfo_DE TEXT,
    FOREIGN KEY (Product_Name) REFERENCES Product(Name)
);

-- Product Datasheets
CREATE TABLE IF NOT EXISTS ProductDatasheet (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Product_Name TEXT UNIQUE,
    FileUrl TEXT,
    DatasheetName_EN TEXT,
    DatasheetName_DE TEXT,
    FOREIGN KEY (Product_Name) REFERENCES Product(Name)
);

-- Product Categories
CREATE TABLE IF NOT EXISTS ProductCategory (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name_EN TEXT,
    Name_DE TEXT,
    UNIQUE(Name_EN, Name_DE)
);

-- Join table for Products and Categories (many-to-many)
CREATE TABLE IF NOT EXISTS Join_Product_Category (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Product_Name TEXT,
    Category_Id INTEGER,
    SortOrder INTEGER,
    FOREIGN KEY (Product_Name) REFERENCES Product(Name),
    FOREIGN KEY (Category_Id) REFERENCES ProductCategory(Id),
    UNIQUE(Product_Name, Category_Id)
); 