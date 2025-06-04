import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useProgress, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { SceneData, MeasurePoint } from '../types';

interface Scene3DProps {
  sceneData?: SceneData;
  configuration: Record<string, string>;
  selectedMeasurePoint?: string | null;
  onMeasurePointClick?: (measurePointId: string) => void;
  products?: Record<string, { Object3D_Url: string; Name: string }>;
}

// Loading Spinner für 3D-Inhalte
const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center text-white">
        <div className="loading-spinner w-8 h-8 mb-4"></div>
        <div className="text-sm">Laden... {progress.toFixed(0)}%</div>
      </div>
    </Html>
  );
};

// GLB Model Loader mit DracoLoader Support
const GLBModel: React.FC<{
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}> = ({ url, position, rotation = [0, 0, 0], scale = [1, 1, 1] }) => {
  try {
    const { scene } = useGLTF(url);
    
    return (
      <primitive 
        object={scene.clone()} 
        position={position} 
        rotation={rotation} 
        scale={scale}
      />
    );
  } catch (error) {
    console.error(`Failed to load GLB model: ${url}`, error);
    // Fallback zu einem einfachen Platzhalter
    return (
      <mesh position={position} rotation={rotation} scale={scale}>
        <boxGeometry args={[2, 1, 0.5]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
    );
  }
};

// Produktlinie-Modell (neuelinie.glb)
const ProductionLineModel: React.FC<{
  url?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}> = ({ url = '/assets/neuelinie.glb', position, rotation = [0, 0, 0], scale = [1, 1, 1] }) => {
  return (
    <GLBModel
      url={url}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
};

// SIKORA Produkt-Modell mit GLB Support
const SikoraProductModel: React.FC<{
  url: string;
  position: [number, number, number];
  scale?: [number, number, number];
  isSelected?: boolean;
  onClick?: () => void;
}> = ({ url, position, scale = [1, 1, 1], isSelected = false, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Versuche zuerst GLB zu laden, wenn URL vorhanden
  if (url && (url.endsWith('.glb') || url.endsWith('.gltf'))) {
    try {
      return (
        <group
          position={position}
          scale={scale}
          onClick={onClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'auto';
          }}
        >
          <GLBModel url={url} position={[0, 0, 0]} />
          
          {/* Produktname-Label */}
          <Html position={[0, 1, 0]} center>
            <div className={`px-2 py-1 rounded text-xs font-medium border border-gray-200 shadow-sm ${
              isSelected ? 'bg-sikora-cyan text-sikora-blue' : 'bg-white/90 text-sikora-blue'
            }`}>
              SIKORA Produkt
            </div>
          </Html>
        </group>
      );
    } catch (error) {
      console.error(`Failed to load product model: ${url}`, error);
    }
  }

  // Fallback zu Standard-Zylinder
  return (
    <group position={position} onClick={onClick}>
      <mesh
        ref={meshRef}
        scale={scale}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'auto';
        }}
      >
        <cylinderGeometry args={[0.3, 0.3, 1.5, 8]} />
        <meshStandardMaterial 
          color={isSelected ? "#00A2D4" : "#003A62"} 
          emissive={isSelected ? "#001a2e" : "#000000"}
        />
      </mesh>
      
      {/* Produktname-Label */}
      <Html position={[0, 1, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-medium border border-gray-200 shadow-sm ${
          isSelected ? 'bg-sikora-cyan text-sikora-blue' : 'bg-white/90 text-sikora-blue'
        }`}>
          SIKORA Produkt
        </div>
      </Html>
    </group>
  );
};

// Messpunkt-Marker
const MeasurePointMarker: React.FC<{
  measurePoint: MeasurePoint;
  hasProduct: boolean;
  isSelected: boolean;
  onClick: () => void;
}> = ({ measurePoint, hasProduct, isSelected, onClick }) => {
  const position: [number, number, number] = [
    measurePoint.SpacePosX,
    measurePoint.SpacePosY + 0.5,
    measurePoint.SpacePosZ,
  ];

  return (
    <group position={position} onClick={onClick}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color={hasProduct ? "#00A2D4" : "#ff6b6b"}
          emissive={isSelected ? "#003366" : "#000000"}
        />
      </mesh>
      
      {/* Nummeriertes Label */}
      <Html position={[0, 0.5, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-bold text-white border-2 ${
          hasProduct ? 'bg-sikora-blue border-sikora-cyan' : 'bg-red-500 border-red-300'
        }`}>
          {measurePoint.Position || measurePoint.Id}
        </div>
      </Html>
    </group>
  );
};

// Haupt-3D-Szene
const Scene3D: React.FC<Scene3DProps> = ({
  sceneData,
  configuration,
  selectedMeasurePoint,
  onMeasurePointClick,
  products = {},
}) => {
  const scene = sceneData?.scene;
  const measurePoints = sceneData?.measurePoints || [];
  const staticObjects = sceneData?.staticObjects || [];

  // Kamera-Start-Position aus der Datenbank
  const cameraPosition: [number, number, number] = scene 
    ? [scene.CameraStartX, scene.CameraStartY, scene.CameraStartZ]
    : [0, 5, 10];

  return (
    <div className="w-full h-full bg-slate-800 rounded-lg overflow-hidden">
      <Canvas
        camera={{ 
          position: cameraPosition,
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        shadows
      >
        <Suspense fallback={<Loader />}>
          {/* Beleuchtung */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />

          {/* Umgebung */}
          <Environment preset="warehouse" />

          {/* Statische Objekte aus der Datenbank (inkl. neuelinie.glb) */}
          {staticObjects.map((obj, index) => (
            <GLBModel
              key={obj.id || `static-${index}`}
              url={obj.url.startsWith('/') ? obj.url : `/api/assets/${obj.url}`}
              position={obj.position}
              rotation={obj.rotation}
              scale={obj.scale}
            />
          ))}

          {/* Fallback: Statische Produktionslinie falls keine statischen Objekte */}
          {staticObjects.length === 0 && (
            <ProductionLineModel
              url="/api/assets/neuelinie.glb"
              position={[0, 0, 0]}
            />
          )}

          {/* Messpunkte */}
          {measurePoints.map((measurePoint) => {
            const configuredProductName = configuration[measurePoint.Id.toString()];
            const hasProduct = !!configuredProductName;
            const isSelected = selectedMeasurePoint === measurePoint.Id.toString();
            
            // Get the product 3D URL if available
            const productData = configuredProductName ? products[configuredProductName] : null;
            const productUrl = productData ? productData.Object3D_Url : configuredProductName;

            return (
              <React.Fragment key={measurePoint.Id}>
                <MeasurePointMarker
                  measurePoint={measurePoint}
                  hasProduct={hasProduct}
                  isSelected={isSelected}
                  onClick={() => onMeasurePointClick?.(measurePoint.Id.toString())}
                />

                {/* Konfigurierte Produkte */}
                {hasProduct && productUrl && (
                  <SikoraProductModel
                    url={productUrl.startsWith('/api/') ? productUrl : productUrl.startsWith('/') ? productUrl : `/api/assets/models/${productUrl}`}
                    position={[measurePoint.SpacePosX, measurePoint.SpacePosY, measurePoint.SpacePosZ]}
                    isSelected={isSelected}
                    onClick={() => onMeasurePointClick?.(measurePoint.Id.toString())}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* Boden */}
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#f8f9fa" />
          </mesh>

          {/* Orbit Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            target={[0, 0, 0]}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={5}
            maxDistance={50}
          />
        </Suspense>
      </Canvas>

      {/* 3D-Kontrollen Overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
        <button
          className="text-white hover:text-sikora-cyan transition-colors duration-200 p-1"
          title="Hineinzoomen"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>
        <button
          className="text-white hover:text-sikora-cyan transition-colors duration-200 p-1"
          title="Herauszoomen"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        <button
          className="text-white hover:text-sikora-cyan transition-colors duration-200 p-1"
          title="Szene zurücksetzen"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Scene3D; 