# Skript zur Erstellung einer identischen Ordnerstruktur in NEW_Images
# und zum Auffinden und Konvertieren von Bildern

# Basis-Pfade
$modelsPath = ".\models"
$oldImagesPath = ".\OLD_Images\SIKORA_BILDER"
$newImagesPath = ".\NEW_Images"

# Funktion, um Dateien basierend auf Teilnamen zu finden
function Find-BestMatchingFile {
    param (
        [string]$baseName,
        [string]$searchPath
    )
    
    # Normalisieren des Basisnamens für die Suche
    $searchTerms = $baseName.ToUpper().Replace("_", " ").Split(" ")
    
    # Entferne eventuelle Untervarianten wie "xy", "t", "sr", "fr"
    $mainSearchTerms = $searchTerms | Where-Object { 
        $_ -notin @("XY", "T", "SR", "FR", "C") -and $_.Length -gt 1 
    }
    
    Write-Host "Suche nach: $($mainSearchTerms -join ', ')" -ForegroundColor Cyan
    
    # Alle Dateien im Suchpfad durchsuchen
    $allFiles = Get-ChildItem -Path $searchPath -File
    $bestMatches = @()
    
    # Suche nach Dateien, die alle Hauptsuchbegriffe enthalten
    foreach ($file in $allFiles) {
        $fileName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name).ToUpper()
        $matchCount = 0
        
        foreach ($term in $mainSearchTerms) {
            if ($fileName -match $term) {
                $matchCount++
            }
        }
        
        # Wenn alle Hauptbegriffe gefunden wurden
        if ($matchCount -eq $mainSearchTerms.Count -and $mainSearchTerms.Count -gt 0) {
            # Füge Dateipfad und Übereinstimmungswert zum Array hinzu
            $bestMatches += [PSCustomObject]@{
                FilePath = $file.FullName
                MatchCount = $matchCount
                FileName = $file.Name
            }
        }
    }
    
    # Wenn keine vollständige Übereinstimmung gefunden wurde, versuche teilweise Übereinstimmungen
    if ($bestMatches.Count -eq 0 -and $mainSearchTerms.Count -gt 1) {
        foreach ($file in $allFiles) {
            $fileName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name).ToUpper()
            $matchCount = 0
            
            foreach ($term in $mainSearchTerms) {
                if ($fileName -match $term) {
                    $matchCount++
                }
            }
            
            # Wenn mindestens ein Begriff gefunden wurde
            if ($matchCount -gt 0) {
                # Füge Dateipfad und Übereinstimmungswert zum Array hinzu
                $bestMatches += [PSCustomObject]@{
                    FilePath = $file.FullName
                    MatchCount = $matchCount
                    FileName = $file.Name
                }
            }
        }
    }
    
    # Sortiere nach Anzahl der Übereinstimmungen und gib die beste zurück
    if ($bestMatches.Count -gt 0) {
        $bestMatch = $bestMatches | Sort-Object -Property MatchCount -Descending | Select-Object -First 1
        Write-Host "  Beste Übereinstimmung: $($bestMatch.FileName)" -ForegroundColor Green
        return $bestMatch.FilePath
    }
    
    return $null
}

# Alle Unterordner in models durchlaufen
Get-ChildItem -Path $modelsPath -Directory | ForEach-Object {
    $modelFolderName = $_.Name
    $newFolderPath = Join-Path $newImagesPath $modelFolderName
    
    # Erstellen des Unterordners in NEW_Images
    New-Item -Path $newFolderPath -ItemType Directory -Force | Out-Null
    Write-Host "Ordner erstellt: $newFolderPath"
    
    # Alle GLB-Dateien im Unterordner durchlaufen
    Get-ChildItem -Path $_.FullName -Filter "*.glb" | ForEach-Object {
        $glbFileName = $_.Name
        $baseFileName = [System.IO.Path]::GetFileNameWithoutExtension($glbFileName)
        
        # Suchen der entsprechenden Bilddatei in OLD_Images
        $matchingFile = Find-BestMatchingFile -baseName $baseFileName -searchPath $oldImagesPath
        
        if ($matchingFile) {
            $targetImagePath = Join-Path $newFolderPath "$baseFileName.jpeg"
            
            # Kopieren und Umbenennen der Datei
            Copy-Item -Path $matchingFile -Destination $targetImagePath -Force
            Write-Host "Datei kopiert: $matchingFile -> $targetImagePath"
        } else {
            Write-Host "Keine passende Datei gefunden für: $baseFileName" -ForegroundColor Yellow
        }
    }
}

Write-Host "Vorgang abgeschlossen!" -ForegroundColor Green 