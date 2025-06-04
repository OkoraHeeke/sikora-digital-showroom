-- Author: Levi Palait @ SIKORA AG
-- Dieses SQL Script erstellt alle benötigen SQLite Tabellen und Views für die Anwendung.

-- Stellt einen Messparameter dar. Ein Messpunkt kann viele Messparameter haben, welche dann
-- ausgewählt werden können. Außerdem kann ein Produkt viele Messparameter haben, nach denen
-- dann gefiltert werden kann
CREATE TABLE "MeasureParameter" (
	"Id"	INTEGER NOT NULL UNIQUE,
	"Name_EN"	TEXT NOT NULL UNIQUE,
	"Name_DE"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("Id" AUTOINCREMENT)
);

-- Stellt eine Szene dar. Eine Szene kann viele Produkte und Messpunkte haben.
-- CameraStartX, Y und Z sind die Koordinaten, die die Kamera beim Starten der Szene haben soll.
-- Sie schaut allerdings immmer auf (0, 0, 0) nachdem die Szene gestartet wurde
CREATE TABLE "Scene" (
	"Id"	INTEGER NOT NULL UNIQUE,
	"Name_EN"	TEXT NOT NULL UNIQUE,
	"Name_DE"	TEXT NOT NULL UNIQUE,
	"CameraStartX"	REAL NOT NULL,
	"CameraStartY"	REAL NOT NULL,
	"CameraStartZ"	REAL NOT NULL,
	PRIMARY KEY("Id" AUTOINCREMENT)
);

-- Stellt eine Datei eines 3D-Objekts dar. Dieses wird eindeutig durch seine URL (Dateinamen) identifiziert.
-- Wenn sich einmal ein Dateiname zu einem bestimmten Objekt ändert, dann muss nur noch
-- in dieser Tabelle der Name geändert werden und überall sonst passiert das automatisch (Durch ON UPDATE CASCADE)
CREATE TABLE "Object3D" (
	"Url"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("Url")
);

-- Stellt einen Messpunkt dar. Ein Messpunkt ist einer Szene zugeordnet (durch Scene_Id) und
-- hat eine Position im Raum (SpacePosX, SpacePosY, SpacePosZ)
-- Dazu hat ein Messpunkt einen Namen (z.B. "vor Extrusion") und wird durch eine Id identifiziert
CREATE TABLE "MeasurePoint" (
	"Id"	INTEGER NOT NULL UNIQUE,
	"Name_EN"	TEXT NOT NULL,
	"Name_DE"	TEXT NOT NULL,
	"SpacePosX"	REAL NOT NULL,
	"SpacePosY"	REAL NOT NULL,
	"SpacePosZ"	REAL NOT NULL,
	"Scene_Id"	INTEGER NOT NULL,
	PRIMARY KEY("Id" AUTOINCREMENT),
	FOREIGN KEY("Scene_Id") REFERENCES "Scene"("Id")
);

-- Stellt ein Produkt dar und wird eindeutig durch den Namen identifiziert.
-- Es wird zudem die Url von einem 3D-Objekt angegeben, eine ImageUrl für das Produktbild
-- und eine HTML Beschreibung in Englisch und Deutsch, welche dann in die rechte Spalte 
-- des App-Fensters eingefügt wird.
CREATE TABLE "Product" (
	"Name"	TEXT NOT NULL UNIQUE,
	"HTMLDescription_EN"	TEXT NOT NULL,
	"HTMLDescription_DE"	TEXT NOT NULL,
	"ImageUrl"	TEXT NOT NULL,
	"Object3D_Url"	TEXT NOT NULL,
	PRIMARY KEY("Name"),
	FOREIGN KEY("Object3D_Url") REFERENCES "Object3D"("Url") ON UPDATE CASCADE 	-- Das hier sorgt dafür, dass wenn sich der Name des
);																				-- 3D-Objekts ändert, sich das auch hier ändert

-- Stellt eine Produktspezifikation dar. Eine Spezifikation hat einen Titel (z.B. "Messrate") und 
-- einen entsprechenden Wert (z.B. "1.200/sek"). Sie ist einem Produkt über die Product_Name zugeordnet.
CREATE TABLE "ProductSpecification" (
	"Id"	INTEGER NOT NULL UNIQUE,
	"Product_Name"	TEXT NOT NULL,
	"Title_EN"	TEXT NOT NULL,
	"Title_DE"	TEXT NOT NULL,
	"Value_EN"	TEXT NOT NULL,
	"Value_DE"	TEXT NOT NULL,
	"SortOrder"	INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY("Id" AUTOINCREMENT),
	FOREIGN KEY("Product_Name") REFERENCES "Product"("Name") ON UPDATE CASCADE
);

-- Stellt ein Produktmerkmal dar. Diese Tabelle enthält die besonderen Merkmale eines Produkts.
-- Jedes Merkmal ist einem Produkt über die Product_Name zugeordnet.
CREATE TABLE "ProductFeature" (
	"Id"	INTEGER NOT NULL UNIQUE,
	"Product_Name"	TEXT NOT NULL,
	"Feature_EN"	TEXT NOT NULL,
	"Feature_DE"	TEXT NOT NULL,
	"SortOrder"	INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY("Id" AUTOINCREMENT),
	FOREIGN KEY("Product_Name") REFERENCES "Product"("Name") ON UPDATE CASCADE
);

-- Stellt einen Produktvorteil dar. Diese Tabelle enthält die Vorteile eines Produkts.
-- Jeder Vorteil ist einem Produkt über die Product_Name zugeordnet.
CREATE TABLE "ProductAdvantage" (
	"Id"	INTEGER NOT NULL UNIQUE,
	"Product_Name"	TEXT NOT NULL,
	"Advantage_EN"	TEXT NOT NULL,
	"Advantage_DE"	TEXT NOT NULL,
	"SortOrder"	INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY("Id" AUTOINCREMENT),
	FOREIGN KEY("Product_Name") REFERENCES "Product"("Name") ON UPDATE CASCADE
);

-- Stellt Installationsinformationen zu einem Produkt dar.
-- Diese Informationen sind einem Produkt über die Product_Name zugeordnet.
CREATE TABLE "ProductInstallation" (
	"Id"	INTEGER NOT NULL UNIQUE,
	"Product_Name"	TEXT NOT NULL,
	"InstallationInfo_EN"	TEXT NOT NULL,
	"InstallationInfo_DE"	TEXT NOT NULL,
	PRIMARY KEY("Id" AUTOINCREMENT),
	FOREIGN KEY("Product_Name") REFERENCES "Product"("Name") ON UPDATE CASCADE
);

-- Stellt Datenblattinformationen zu einem Produkt dar.
-- Diese Informationen sind einem Produkt über die Product_Name zugeordnet.
CREATE TABLE "ProductDatasheet" (
	"Id"	INTEGER NOT NULL UNIQUE,
	"Product_Name"	TEXT NOT NULL,
	"FileUrl"	TEXT NOT NULL,
	"DatasheetName_EN"	TEXT NOT NULL,
	"DatasheetName_DE"	TEXT NOT NULL,
	PRIMARY KEY("Id" AUTOINCREMENT),
	FOREIGN KEY("Product_Name") REFERENCES "Product"("Name") ON UPDATE CASCADE
);

-- Stellt eine Produktkategorie dar. Jede Kategorie hat einen Namen in Englisch und Deutsch.
CREATE TABLE "ProductCategory" (
	"Id"	INTEGER NOT NULL UNIQUE,
	"Name_EN"	TEXT NOT NULL UNIQUE,
	"Name_DE"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("Id" AUTOINCREMENT)
);

-- Join-Tabelle zwischen Produkten und Kategorien. Durch diese Tabelle können
-- Produkten Kategorien zugeordnet werden. Ein Produkt kann bis zu drei Kategorien haben.
CREATE TABLE "Join_Product_Category" (
	"Product_Name"	TEXT NOT NULL,
	"Category_Id"	INTEGER NOT NULL,
	"SortOrder"	INTEGER NOT NULL DEFAULT 0, -- Reihenfolge der Kategorien (1-3)
	PRIMARY KEY("Product_Name", "Category_Id"),
	FOREIGN KEY("Product_Name") REFERENCES "Product"("Name") ON UPDATE CASCADE,
	FOREIGN KEY("Category_Id") REFERENCES "ProductCategory"("Id")
);

-- Die Join-Tabelle zwischen Produkten und Messparametern. Durch diese Tabelle können
-- Produkten Messparameter zugeordnet werden. Dies ist nötig, weil viele Produkte denselben
-- Messparameter (z.B. LASER und CENTERVIEW haben beide den Parameter Durchmesser) und dazu
-- dann viele Messparameter in dem selben Produkt vorkommen können (z.B. sind Durchmesser und Ovalität dem LASER zugeordnet)
-- Dies nennt man auch Many-to-Many Relation und dies besagt, dass viele Produkte viele Messparameter haben können und umgekehrt
-- viele Messparameter viele Produkte haben können.
CREATE TABLE "Join_Product_MeasureParameter" (
	"Product_Name"	TEXT NOT NULL,
	"MeasureParameter_Id"	INTEGER NOT NULL,
	PRIMARY KEY("Product_Name", "MeasureParameter_Id"),
	FOREIGN KEY("Product_Name") REFERENCES "Product"("Name") ON UPDATE CASCADE,
	FOREIGN KEY("MeasureParameter_Id") REFERENCES "MeasureParameter"("Id")
);

-- Die Join-Tabelle zwischen Messpunkten und Messparametern. Durch diese Tabelle können
-- Messpunkten Messparameter zugeordnet werden. Man weiß also durch diese Tabelle, welcher
-- Messparameter an welchem Messpunkt auswählbar ist.
CREATE TABLE "Join_MeasurePoint_MeasureParameter" (
	"MeasurePoint_Id"	INTEGER NOT NULL,
	"MeasureParameter_Id"	INTEGER NOT NULL,
	PRIMARY KEY("MeasurePoint_Id", "MeasureParameter_Id"),
	FOREIGN KEY("MeasurePoint_Id") REFERENCES "MeasurePoint"("Id"),
	FOREIGN KEY("MeasureParameter_Id") REFERENCES "MeasureParameter"("Id")
);

-- Join-Tabelle zwischen Szenen und Produkten. Durch diese Tabelle kann zugeordnet werden,
-- welche Produkte in welchen Szenen vorkommen dürfen.
CREATE TABLE "Join_Scene_Product" (
	"Scene_Id"	INTEGER NOT NULL,
	"Product_Name"	TEXT NOT NULL,
	PRIMARY KEY("Scene_Id", "Product_Name"),
	FOREIGN KEY("Scene_Id") REFERENCES "Scene"("Id"),
	FOREIGN KEY("Product_Name") REFERENCES "Product"("Name") ON UPDATE CASCADE
);

-- Diese Tabelle ist die Anti-Join-Tabelle zwischen Messpunkten und Produkten. Durch diese kann
-- man feinfühlig einstellen, welche Produkte an welchen Messpunkten NICHT vorkommen dürfen.
-- Wenn man beispielsweise für ein Produkt angegeben hat, dass es in einer Szene vorkommen darf, dann
-- darf es standardmäßig an allen Messpunkten angezeigt werden, wenn es die Auswahl der Parameter erfüllt.
-- Wenn man jedoch ein bestimmtes Produkt von einem bestimmten Messpunkt ausschließen möchte, kann man 
-- dies in dieser Tabelle tun. Dazu muss einfach in MeasurePoint_Id der Id des Messpunktes und in Product_Name
-- der Name des Produktes eingetragen werden.
CREATE TABLE "AntiJoin_MeasurePoint_Product" (
	"MeasurePoint_Id"	INTEGER NOT NULL,
	"Product_Name"	TEXT NOT NULL,
	PRIMARY KEY("MeasurePoint_Id", "Product_Name"),
	FOREIGN KEY("MeasurePoint_Id") REFERENCES "MeasurePoint"("Id"),
	FOREIGN KEY("Product_Name") REFERENCES "Product"("Name") ON UPDATE CASCADE
);

-- Diese Tabelle gibt an wie ein 3D-Objekt an einem Messpunkt platziert werden soll. Ein Messpunkt hat ja schon eine
-- Position im Raum, aber es kann dazu kommen, dass das 3D-Objekt noch ein wenig verschoben oder rotiert werden muss,
-- damit es an diesem Punkt gut aussieht. In dem Fall kann in dieser Tabell für ein Objekt an einem bestimmten Messpunkt
-- eine Verschiebung und Rotation angegeben werden. Die Verschiebung ist relativ zur Position des Messpunktes selber.
CREATE TABLE "Map_MeasurePoint_Object3D_Placement" (
	"MeasurePoint_Id"	INTEGER NOT NULL,
	"Object3D_Url"	TEXT NOT NULL,
	"XOffset"	REAL NOT NULL,
	"YOffset"	REAL NOT NULL,
	"ZOffset"	REAL NOT NULL,
	"XRotation"	REAL NOT NULL,
	"YRotation"	REAL NOT NULL,
	"ZRotation"	REAL NOT NULL,
	"Scale"	REAL NOT NULL,
	PRIMARY KEY("MeasurePoint_Id", "Object3D_Url"),
	FOREIGN KEY("MeasurePoint_Id") REFERENCES "MeasurePoint"("Id"),
	FOREIGN KEY("Object3D_Url") REFERENCES "Object3D"("Url") ON UPDATE CASCADE
);

-- Diese Tabelle gibt an, wo in welcher Szene statische Objekte platziert sind. Ein statisches Objekt ist ein 3D-Objekt,
-- was direkt von Anfang an in der Szene platziert wird. Hier wird angegeben, welches Objekt in welcher Szene wo und wie
-- platziert wird. Die Position ist relativ zum Koordinatenursprung der Szene.
CREATE TABLE "Map_Scene_Object3D_Static_Placement" (
	"Id"	INTEGER NOT NULL UNIQUE,
	"Scene_Id"	INTEGER NOT NULL,
	"Object3D_Url"	TEXT NOT NULL,
	"XPosition"	REAL NOT NULL,
	"YPosition"	REAL NOT NULL,
	"ZPosition"	REAL NOT NULL,
	"XRotation"	REAL NOT NULL,
	"YRotation"	REAL NOT NULL,
	"ZRotation"	REAL NOT NULL,
	"Scale"	REAL NOT NULL,
	PRIMARY KEY("Id" AUTOINCREMENT),
	FOREIGN KEY("Scene_Id") REFERENCES "Scene"("Id"),
	FOREIGN KEY("Object3D_Url") REFERENCES "Object3D"("Url") ON UPDATE CASCADE
);

-- Diese View gibt zu jeder Szene alle Messpunkte und dann zu jedem Messpunkt zusätzlich alle Messparameter zurück.
-- Eine View ist einfach nur eine Ansicht auf eine oder Mehrere Tabellen, die wie eine Tabelle benutzt werden kann.
-- In diesem Fall wird die View benutzt, um die Daten für die App zu holen und dies in einer einzigen, kurzen Anfrage zu tun.
CREATE VIEW "GetSceneMP_View" AS
SELECT
	s."Id" AS "S_Id",
	s."Name_EN" AS "S_Name_EN",
	s."Name_DE" AS "S_Name_DE",
	s."CameraStartX" AS "S_CameraStartX",
	s."CameraStartY" AS "S_CameraStartY",
	s."CameraStartZ" AS "S_CameraStartZ",
	mpoint."Id" AS "MPOINT_Id",
	mpoint."Name_EN" AS "MPOINT_Name_EN",
	mpoint."Name_DE" AS "MPOINT_Name_DE",
	mpoint."SpacePosX" AS "MPOINT_SpacePosX",
	mpoint."SpacePosY" AS "MPOINT_SpacePosY",
	mpoint."SpacePosZ" AS "MPOINT_SpacePosZ",
	mparam."Name_EN" AS "MPARAM_Name_EN",
	mparam."Name_DE" AS "MPARAM_Name_DE"
FROM
	"Scene" s
	JOIN "MeasurePoint" mpoint ON (s."Id" = mpoint."Scene_Id")
	JOIN "Join_MeasurePoint_MeasureParameter" jmm ON (mpoint."Id" = jmm."MeasurePoint_Id")
	JOIN "MeasureParameter" mparam ON (jmm."MeasureParameter_Id" = mparam."Id")
ORDER BY "S_Id", "MPOINT_Id";

-- Diese View gibt zu jeder Szene alle Statischen objekte zurück, die in der Szene platziert sind.
-- Diese View wir benutzt, um beim Laden einer Szene alle statischen Objekte zu holen und diese dann in der Szene zu platzieren.
CREATE VIEW "GetSceneSO_View" AS
SELECT
	s."Id" AS "S_Id",
	o."Url" AS "O_Url",
	msosp."XPosition" AS "XPosition",
	msosp."YPosition" AS "YPosition",
	msosp."ZPosition" AS "ZPosition",
	msosp."XRotation" AS "XRotation",
	msosp."YRotation" AS "YRotation",
	msosp."ZRotation" AS "ZRotation",
	msosp."Scale" AS "Scale"
FROM
	"Scene" s
	JOIN "Map_Scene_Object3D_Static_Placement" msosp ON (s."Id" = msosp."Scene_Id")
	JOIN "Object3D" o ON (msosp."Object3D_Url" = o."Url")
ORDER BY "S_Id" ASC;

-- Diese View ist einfach nur eine vereinfachte Sicht auf die "Scene"-Tabelle.
-- Diese enthält nur die Id und die Namen der Szene.
CREATE VIEW "GetScenes_View" AS
SELECT
	s."Id" AS "S_Id",
	s."Name_EN" AS "S_Name_EN",
	s."Name_DE" AS "S_Name_DE"
FROM "Scene" s
ORDER BY s."Id" ASC;