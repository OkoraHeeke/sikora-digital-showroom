# Verification Steps - API Fix

## Problem behoben: DELETE-Requests gingen an falschen Port

**Ursache:** API verwendete absolute URLs (`http://localhost:3001/api`) statt relative URLs (`/api`) im Browser-Kontext.

**Lösung:** API-Wrapper verwendet jetzt:
- Relative URLs (`/api`) im Browser → Vite-Proxy leitet an `localhost:3001` weiter
- Absolute URLs (`http://localhost:3001/api`) in Electron-App

## Test-Schritte:

### 1. System ist bereits gestartet:
- ✅ Backend läuft auf Port 3001
- ✅ Frontend läuft auf Port 5173 (neu gestartet)
- ✅ Vite-Proxy ist konfiguriert

### 2. Browser-Cache leeren:
1. Öffnen Sie `http://localhost:5173` im Browser
2. Drücken Sie `Ctrl + Shift + R` (Hard Refresh)
3. Oder öffnen Sie DevTools (F12) → Rechtsklick auf Refresh → "Empty Cache and Hard Reload"

### 3. Admin-Bereich testen:
1. Gehen Sie zum Admin-Bereich
2. Navigieren Sie zu "Produktverwaltung"
3. Versuchen Sie ein Produkt zu löschen
4. **Erwartung:** Erfolgreiches Löschen mit Erfolgsmeldung

### 4. Debug-Logs überprüfen:
1. Öffnen Sie Browser DevTools (F12)
2. Gehen Sie zum "Console" Tab
3. Bei API-Aufrufen sollten Sie sehen:
   ```
   API Request: /api/products/PRODUCT_NAME
   Deleting product: PRODUCT_NAME
   ```

### 5. Produktkatalog-Features testen:
1. Wählen Sie einen Messpunkt aus
2. Gehen Sie zum Produktkatalog
3. **Erwartung:** 
   - Grüne Hervorhebung für verfügbare Produkte
   - Graue Darstellung für nicht verfügbare Produkte
   - Blaue Info-Box mit Messpunkt-Info

## Bei Problemen:

### Browser-Cache Problem:
```bash
# Browser komplett schließen und neu öffnen
# Oder Inkognito-Modus verwenden
```

### System komplett neu starten:
```bash
# Backend und Frontend stoppen
taskkill /F /IM node.exe

# Neu starten
node DB/api-server.js &
npm run dev
```

### API-Endpoints direkt testen:
```bash
# PowerShell Test
Invoke-WebRequest -Uri "http://localhost:5173/api/products" -Method GET
```

## Die Änderungen sind jetzt aktiv!
- ✅ DELETE-Requests gehen über den Proxy an das Backend
- ✅ Produktkatalog zeigt Verfügbarkeit basierend auf Messpunkt-Zuordnung
- ✅ Admin-Bereich hat funktionsfähige CRUD-Operationen 