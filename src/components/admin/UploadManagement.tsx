import React, { useState, useRef } from 'react';
import { 
  Upload, 
  File, 
  Image, 
  Box,
  Check,
  X,
  AlertCircle,
  UploadCloud
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface UploadResult {
  filename: string;
  status: 'success' | 'error';
  message: string;
  url?: string;
}

const UploadManagement: React.FC = () => {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = {
    images: '.jpg,.jpeg,.png,.gif,.webp,.svg',
    models: '.glb,.gltf',
    documents: '.pdf,.doc,.docx'
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    uploadFiles(fileArray);
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    const results: UploadResult[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        // Bestimme Upload-Kategorie basierend auf Dateityp
        const fileType = file.type.toLowerCase();
        let category = 'other';
        
        if (fileType.startsWith('image/')) {
          category = 'images';
        } else if (file.name.toLowerCase().endsWith('.glb') || file.name.toLowerCase().endsWith('.gltf')) {
          category = 'models';
        } else if (fileType === 'application/pdf' || fileType.includes('document')) {
          category = 'documents';
        }

        formData.append('category', category);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          results.push({
            filename: file.name,
            status: 'success',
            message: data.message || 'Upload erfolgreich',
            url: data.url
          });
        } else {
          const error = await response.text();
          results.push({
            filename: file.name,
            status: 'error',
            message: error || 'Upload fehlgeschlagen'
          });
        }
      } catch (error) {
        results.push({
          filename: file.name,
          status: 'error',
          message: 'Netzwerkfehler beim Upload'
        });
      }
    }

    setUploadResults(results);
    setUploading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const clearResults = () => {
    setUploadResults([]);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('uploadManagement', 'Upload-Verwaltung', 'Upload Management')}
          </h2>
          <p className="text-gray-600">
            {t('uploadDescription', 'Dateien für die Anwendung hochladen', 'Upload files for the application')}
          </p>
        </div>
      </div>

      {/* Upload-Bereich */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('uploadFiles', 'Dateien hochladen', 'Upload Files')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('uploadInstructions', 'Ziehen Sie Dateien hierher oder klicken Sie zum Auswählen', 'Drag files here or click to select')}
          </p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? t('uploading', 'Lade hoch...', 'Uploading...') : t('selectFiles', 'Dateien auswählen', 'Select Files')}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={`${acceptedTypes.images},${acceptedTypes.models},${acceptedTypes.documents}`}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Unterstützte Dateitypen */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Image className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Bilder</div>
              <div className="text-sm text-gray-600">JPG, PNG, GIF, WebP, SVG</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Box className="w-6 h-6 text-green-600" />
            <div>
              <div className="font-medium text-gray-900">3D-Modelle</div>
              <div className="text-sm text-gray-600">GLB, GLTF</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <File className="w-6 h-6 text-purple-600" />
            <div>
              <div className="font-medium text-gray-900">Dokumente</div>
              <div className="text-sm text-gray-600">PDF, DOC, DOCX</div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload-Ergebnisse */}
      {uploadResults.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('uploadResults', 'Upload-Ergebnisse', 'Upload Results')}
            </h3>
            <button
              onClick={clearResults}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {uploadResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    result.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {result.status === 'success' ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{result.filename}</div>
                      <div className={`text-sm ${
                        result.status === 'success' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.message}
                      </div>
                      {result.url && (
                        <div className="text-xs text-gray-500 mt-1">
                          URL: {result.url}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload-Hinweise */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">
              {t('uploadTips', 'Upload-Hinweise', 'Upload Tips')}
            </h4>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• Maximale Dateigröße: 50MB pro Datei</li>
              <li>• 3D-Modelle sollten optimiert sein für Web-Darstellung</li>
              <li>• Bilder werden automatisch komprimiert</li>
              <li>• Dateien werden in das /assets Verzeichnis hochgeladen</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadManagement; 