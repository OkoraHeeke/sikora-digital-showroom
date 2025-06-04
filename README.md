# SIKORA Digital Showroom - Linienkonfigurator

Eine moderne React-Anwendung für die Konfiguration von SIKORA Produktionslinien mit vollständiger Datenbank-Integration und 3D-Visualisierung.

## 🚀 Features

- **Exaktes SIKORA Corporate Design** basierend auf den bereitgestellten Screenshots
- **Vollständige SQLite-Datenbank-Integration** mit echten SIKORA-Produktdaten
- **3D-Visualisierung** mit Three.js und React Three Fiber
- **Responsive Design** für Desktop und Tablet
- **TypeScript** für Type Safety
- **Tailwind CSS** für schnelle Styling-Entwicklung

## 📁 Projektstruktur

```
src/
├── components/          # React-Komponenten
│   ├── Header.tsx       # App-Header mit SIKORA Logo
│   ├── LineSelection.tsx # Linienauswahl (3 Karten)
│   ├── ConfigurationSidebar.tsx # Linke Sidebar mit Messpunkten
│   ├── Scene3D.tsx      # 3D-Szenen-Komponente
│   └── DetailsPanel.tsx # Rechte Details-Sidebar
├── services/            # API-Services
│   └── database.ts      # Datenbank-Service
├── types/              # TypeScript-Typen
│   └── index.ts        # Alle Interface-Definitionen
├── App.tsx             # Haupt-App-Komponente
├── main.tsx            # Entry Point
└── index.css           # Globale Styles

DB/                     # Datenbank & API
├── database.sqlite     # SQLite-Datenbank
├── api-server.js       # API-Server für Frontend
├── create_schema.sql   # Datenbankschema
└── README.md          # Datenbank-Dokumentation
```

## 🛠 Installation & Setup

### 1. Dependencies installieren

```bash
npm install
```

### 2. Datenbank initialisieren

```bash
npm run db:init
```

### 3. API-Server starten

```bash
npm run db:server
```

Der API-Server läuft auf `http://localhost:3001`

### 4. Frontend starten

```bash
npm run dev
```

Die Anwendung ist erreichbar unter `http://localhost:3000`

## 🎨 Design-System

### SIKORA Corporate Colors

```css
:root {
  --sikora-blue: #003A62;        /* SIKORA Blau - Pantone 2965 C */
  --sikora-cyan: #00A2D4;        /* SIKORA Cyan */
  --sikora-gray: #87888a;        /* Draht & Kabel, Glasfaser */
  --sikora-pipe-blue: #4f8196;   /* Rohr & Schlauch */
  --sikora-plastic-green: #4f7d6c; /* Kunststoff */
}
```

### Typography

- **Produktnamen**: IMMER GROSSBUCHSTABEN (z.B. "LASER 2005 XY")
- **Font Family**: `'Futura', 'Trebuchet MS', 'Arial', sans-serif`
- **Logo**: 20% der kürzeren Seite, minimum 178px

## 🏗 Architektur

### Layout-Struktur

```
┌─ Header (SIKORA Logo + "Digital Showroom") ─────────────────────┐
└──────────────────────────────────────────────────────────────────┘
┌─ Sidebar (320px) ─┬─ 3D-Bereich (flex) ─┬─ Details (400px) ─┐
│ Konfiguration     │                      │ Details           │
│                   │    [3D-Szene]        │                   │
│ Messpunkte-Liste  │                      │ Produktdetails    │
└───────────────────┴──────────────────────┴───────────────────┘
```

### State Management

```typescript
interface ConfiguratorState {
  selectedScene: Scene | null;
  selectedLineType: LineType | null;
  selectedMeasurePoint: string | null;
  selectedProduct: string | null;
  configuration: Record<string, string>;
  activeTab: 'overview' | 'measurePoints' | 'products';
  measurePoints: MeasurePoint[];
  products: Product[];
  loading: boolean;
}
```

## 🗃 Datenbank-Schema

### Haupttabellen

- **Scene** - 3D-Szenen für verschiedene Produktionslinien
- **MeasurePoint** - Messpunkte mit 3D-Positionen
- **Product** - SIKORA-Produkte mit 3D-Modellen
- **ProductSpecification** - Technische Spezifikationen
- **ProductFeature** - Produktmerkmale
- **ProductAdvantage** - Produktvorteile

### API-Endpoints

```
GET /api/scenes                    # Alle Szenen
GET /api/scenes/:id/measurepoints  # Messpunkte für Szene
GET /api/products                  # Alle Produkte
GET /api/products/:name            # Einzelnes Produkt
GET /api/products/:name/specifications # Produktspezifikationen
```

## 🎯 Verwendung

### 1. Linienauswahl
- Wählen Sie eine der drei Produktionslinien:
  - Kabellinie
  - Rohr- & Schlauchlinie  
  - Glasfaserlinie

### 2. Konfiguration
- **Linke Sidebar**: Messpunkte-Liste mit Konfigurationsstatus
- **3D-Bereich**: Interaktive 3D-Szene der Produktionslinie
- **Rechte Sidebar**: Produktdetails und Aktionen

### 3. Produktauswahl
- Klicken Sie auf einen Messpunkt in der Liste oder 3D-Szene
- Durchsuchen Sie passende SIKORA-Produkte
- Konfigurieren Sie Produkte für Messpunkte

## 🔧 Development

### Scripts

```bash
npm run dev        # Development Server
npm run build      # Production Build
npm run preview    # Preview Production Build
npm run lint       # TypeScript Linting
npm run db:init    # Datenbank initialisieren
npm run db:server  # API-Server starten
```

### Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **3D**: Three.js, React Three Fiber, React Three Drei
- **Backend**: Node.js, Express, SQLite
- **Build**: Vite
- **Icons**: Lucide React

## 📋 Roadmap

### Phase 1: Basis-Implementation ✅
- [x] Layout-Struktur basierend auf Screenshots
- [x] Datenbank-Service und API
- [x] Linienauswahl-Interface
- [x] 3D-Szenen-Grundgerüst
- [x] Messpunkt-Management

### Phase 2: Produktintegration 🚧
- [ ] Vollständige SIKORA-Produktdatenbank
- [ ] Produktauswahl und -konfiguration
- [ ] Echte 3D-Modelle laden
- [ ] Produktfilterung nach Messpunkt-Parametern

### Phase 3: Enhanced Features 📋
- [ ] Konfiguration speichern/laden
- [ ] Export-Funktionen (PDF, Excel)
- [ ] Erweiterte 3D-Interaktionen
- [ ] Mobile Responsive Design

## 🤝 Contributing

1. Fork das Repository
2. Erstellen Sie einen Feature-Branch (`git checkout -b feature/amazing-feature`)
3. Committen Sie Ihre Änderungen (`git commit -m 'Add amazing feature'`)
4. Pushen Sie zum Branch (`git push origin feature/amazing-feature`)
5. Öffnen Sie eine Pull Request

## 📄 License

Dieses Projekt ist Eigentum der SIKORA AG. Alle Rechte vorbehalten.

## 📞 Support

Bei Fragen oder Problemen wenden Sie sich bitte an das SIKORA-Entwicklungsteam.

---

**SIKORA AG** - Technology To Perfection

## 🚀 Quick Deploy to Netlify

### Option 1: Drag & Drop (Fastest)
1. Run `npm run build`
2. Drag the `dist` folder to [netlify.com/drop](https://app.netlify.com/drop)
3. PWA installation will work automatically with HTTPS!

### Option 2: Git Integration
1. Push to GitHub repository
2. Connect repository to Netlify
3. Build settings are pre-configured in `netlify.toml`

## 🛠 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start database API (optional)
npm run db:server
```

## 📱 PWA Features

- ✅ **Offline Support** via Service Worker
- ✅ **Install Button** (works on HTTPS/Netlify)
- ✅ **App Icons** and splash screens
- ✅ **Responsive Design** for mobile/tablet/desktop
- ✅ **Modern Web App Manifest**

## 🎯 Tech Stack

- **React 18** + TypeScript
- **Three.js** + React Three Fiber
- **Tailwind CSS** for styling
- **Vite** for bundling
- **PWA** with Service Worker
- **SQLite** database (optional)

## 🌐 Live Demo

Deploy to Netlify for full PWA experience with HTTPS.

---

**SIKORA GmbH** - Leading measurement technology for cable, pipe & optical fiber production. 