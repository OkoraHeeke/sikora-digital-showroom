import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei';
import type { SceneData, MeasurePoint } from '../types';
import * as THREE from 'three';

interface Scene3DProps {
  sceneData?: SceneData;
  configuration: Record<string, string>;
  selectedMeasurePoint?: string | null;
  onMeasurePointClick?: (measurePointId: string) => void;
  products?: Record<string, { Object3D_Url: string; Name: string }>;
}

// Loader-Komponente
const Loader = () => {
  return (
    <Html center>
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-sikora-blue rounded-full animate-bounce"></div>
        <div className="w-4 h-4 bg-sikora-cyan rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-4 h-4 bg-sikora-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </Html>
  );
};

// GLB-Modell-Komponente
const GLBModel: React.FC<{
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}> = ({ url, position, rotation = [0, 0, 0], scale = [1, 1, 1] }) => {
  try {
    const { scene } = useGLTF(url);
    
    // Clone the scene to avoid shared references
    const clonedScene = scene.clone();
    
    return (
      <primitive
        object={clonedScene}
        position={position}
        rotation={rotation}
        scale={scale}
        castShadow
        receiveShadow
      />
    );
  } catch (error) {
    console.warn(`Failed to load GLB model: ${url}`, error);
    return null;
  }
};

// Produktionslinie-Modell
const ProductionLineModel: React.FC<{
  url?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}> = ({ url = '/assets/neuelinie.glb', position, rotation = [0, 0, 0], scale = [1, 1, 1] }) => {
  try {
    const { scene } = useGLTF(url);
    return (
      <primitive
        object={scene}
        position={position}
        rotation={rotation}
        scale={scale}
        castShadow
        receiveShadow
      />
    );
  } catch (error) {
    console.warn(`Failed to load production line model: ${url}`, error);
    return null;
  }
};

// SIKORA Produkt-Modell (vereinfacht ohne Pop-up und blaue Kugel)
const SikoraProductModel: React.FC<{
  url: string;
  position: [number, number, number];
  scale?: [number, number, number];
  isSelected?: boolean;
  onClick?: () => void;
}> = ({ url, position, scale = [1, 1, 1], isSelected = false, onClick }) => {
  try {
    const { scene } = useGLTF(url);
    const modelRef = useRef<THREE.Group>(null);

    return (
      <group 
        ref={modelRef} 
        position={position} 
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
        <primitive
          object={scene.clone()}
          scale={scale}
          castShadow
          receiveShadow
        />
        {/* Removed blue sphere and popup - only the 3D model now */}
      </group>
    );
  } catch (error) {
    console.warn(`Failed to load SIKORA product model: ${url}`, error);
    return null;
  }
};

// Kamera-Controller für sanfte Bewegung zu Messpunkten
const CameraController: React.FC<{ 
  targetPosition?: [number, number, number]; 
  initialPosition: [number, number, number];
  cameraSettings: Record<string, number>;
  onComplete?: () => void;
}> = ({ targetPosition, initialPosition, cameraSettings, onComplete }) => {
  const { camera } = useThree();
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);
  const [animationPhase, setAnimationPhase] = React.useState<'rotating' | 'moving' | 'idle'>('idle');
  const animationDataRef = useRef<{
    // Rotation phase
    startLookAt: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    rotationProgress: number;
    rotationDuration: number;
    
    // Movement phase  
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    controlPoint: THREE.Vector3;
    movementProgress: number;
    movementDuration: number;
  } | null>(null);

  // Initialize camera position once
  React.useEffect(() => {
    if (!initialized) {
      const initialPos = initialPosition;
      camera.position.set(...initialPos);
      camera.lookAt(0, 0, 0);
      setInitialized(true);
      console.log('📷 Camera initialized to:', initialPos);
    }
  }, [camera, initialized, initialPosition]);

  // Advanced easing functions
  const easeInOutQuart = (t: number): number => {
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
  };

  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  // Smooth bezier curve interpolation
  const quadraticBezier = (t: number, p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3): THREE.Vector3 => {
    const invT = 1 - t;
    return new THREE.Vector3(
      invT * invT * p0.x + 2 * invT * t * p1.x + t * t * p2.x,
      invT * invT * p0.y + 2 * invT * t * p1.y + t * t * p2.y,
      invT * invT * p0.z + 2 * invT * t * p1.z + t * t * p2.z
    );
  };

  // Calculate cinematic camera position and path
  const calculateCinematicPath = (targetPos: [number, number, number], startPos: THREE.Vector3) => {
    const [x, y, z] = targetPos;
    
    // Use the camera settings from parent component
    const { FIXED_DISTANCE, ELEVATION_ANGLE, AZIMUTH_OFFSET } = cameraSettings;
    
    // Calculate position on a sphere around the measure point
    // This ensures always the same distance to the measure point
    const horizontalDistance = FIXED_DISTANCE * Math.cos(ELEVATION_ANGLE);
    const verticalOffset = FIXED_DISTANCE * Math.sin(ELEVATION_ANGLE);
    
    const cameraX = x + horizontalDistance * Math.cos(AZIMUTH_OFFSET);
    const cameraY = y + verticalOffset;
    const cameraZ = z + horizontalDistance * Math.sin(AZIMUTH_OFFSET);
    
    const endPos = new THREE.Vector3(cameraX, cameraY, cameraZ);
    
    // Verify the distance (for debugging)
    const actualDistance = endPos.distanceTo(new THREE.Vector3(x, y, z));
    console.log(`📏 Fixed distance to measure point: ${actualDistance.toFixed(2)} (target: ${FIXED_DISTANCE})`);
    
    // Create a curved path with a control point
    const midPoint = new THREE.Vector3().lerpVectors(startPos, endPos, 0.5);
    const controlPoint = midPoint.clone();
    
    // Make the arc height proportional to the travel distance for smooth movement
    const travelDistance = startPos.distanceTo(endPos);
    const arcHeight = Math.min(6, travelDistance * 0.2); // Max 6 units arc height
    controlPoint.y += arcHeight;
    
    return { endPos, controlPoint };
  };

  // Start animation when targetPosition changes - with better interruption handling
  React.useEffect(() => {
    if (targetPosition && initialized) {
      // Always reset animation state when new target is set
      setIsAnimating(false);
      setAnimationPhase('idle');
      animationDataRef.current = null;
      
      console.log('🚀 Starting two-phase camera animation to:', targetPosition);
      console.log('📍 Current camera position:', camera.position);
      console.log('🔄 Camera initialized:', initialized);
      
      // Small delay to ensure clean state
      setTimeout(() => {
        const { endPos, controlPoint } = calculateCinematicPath(targetPosition, camera.position);
        
        // Get current camera lookAt direction - more robust method
        const currentDirection = new THREE.Vector3();
        camera.getWorldDirection(currentDirection);
        const currentLookAt = new THREE.Vector3().addVectors(camera.position, currentDirection.multiplyScalar(10));
        
        animationDataRef.current = {
          // Phase 1: Rotation
          startLookAt: currentLookAt,
          targetLookAt: new THREE.Vector3(...targetPosition),
          rotationProgress: 0,
          rotationDuration: cameraSettings.ROTATION_DURATION,
          
          // Phase 2: Movement
          startPos: camera.position.clone(),
          endPos: endPos,
          controlPoint: controlPoint,
          movementProgress: 0,
          movementDuration: cameraSettings.MOVEMENT_DURATION
        };

        setIsAnimating(true);
        setAnimationPhase('rotating');
        console.log('🎬 Phase 1: Rotating camera to look at target');
        console.log('📊 Animation data prepared:', animationDataRef.current);
      }, 50); // Small delay to ensure clean state transition
    } else if (!targetPosition) {
      // Clear animation when no target
      setIsAnimating(false);
      setAnimationPhase('idle');
      animationDataRef.current = null;
      console.log('🛑 Animation cleared - no target position');
    }
  }, [targetPosition, camera, initialized, cameraSettings]);

  useFrame((state, delta) => {
    if (!isAnimating || !animationDataRef.current || !targetPosition) return;

    const anim = animationDataRef.current;

    if (animationPhase === 'rotating') {
      // Phase 1: Rotate camera to look at target
      anim.rotationProgress += delta / anim.rotationDuration;

      if (anim.rotationProgress >= 1) {
        // Rotation complete, start movement
        console.log('✅ Phase 1 complete: Camera is now looking at target');
        console.log('🎬 Phase 2: Moving camera to target position');
        anim.rotationProgress = 1;
        camera.lookAt(anim.targetLookAt);
        setAnimationPhase('moving');
      } else {
        // Smooth rotation interpolation
        const t = easeOutCubic(Math.min(anim.rotationProgress, 1));
        const currentLookAt = new THREE.Vector3().lerpVectors(anim.startLookAt, anim.targetLookAt, t);
        camera.lookAt(currentLookAt);
      }
    } else if (animationPhase === 'moving') {
      // Phase 2: Move camera to target position
      anim.movementProgress += delta / anim.movementDuration;

      if (anim.movementProgress >= 1) {
        // Animation complete
        console.log('✅ Phase 2 complete: Camera movement finished');
        camera.position.copy(anim.endPos);
        camera.lookAt(anim.targetLookAt);
        
        setIsAnimating(false);
        setAnimationPhase('idle');
        animationDataRef.current = null;
        
        setTimeout(() => {
          console.log('📍 Two-phase animation complete at:', camera.position);
          onComplete?.();
        }, 100);
      } else {
        // Smooth curved movement with the camera already looking at target
        const t = easeInOutQuart(Math.min(anim.movementProgress, 1));
        
        // Use quadratic bezier curve for smooth arced movement
        const currentPos = quadraticBezier(t, anim.startPos, anim.controlPoint, anim.endPos);
        camera.position.copy(currentPos);
        
        // Keep looking at the target during movement
        camera.lookAt(anim.targetLookAt);
      }
    }
  });

  return null;
};

// Neue Messpunkt-Markierung: Kleine SIKORA-blaue Markierung auf dem Boden
const MeasurePointMarker: React.FC<{
  measurePoint: MeasurePoint;
  hasProduct: boolean;
  isSelected: boolean;
  onClick: () => void;
}> = ({ measurePoint, hasProduct, isSelected, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const position: [number, number, number] = [
    measurePoint.SpacePosX,
    0.05, // Leicht über dem Boden
    measurePoint.SpacePosZ,
  ];

  // Subtle pulsing animation for selected markers
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.setScalar(scale);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Hauptmarkierung */}
        <cylinderGeometry args={[0.4, 0.4, 0.08, 16]} />
        <meshStandardMaterial 
          color={isSelected ? "#0066CC" : "#003A62"}
          transparent
          opacity={isSelected ? 0.95 : 0.8}
          emissive={isSelected ? "#004499" : "#001122"}
          emissiveIntensity={isSelected ? 0.4 : 0.15}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {/* Äußerer Ring für bessere Sichtbarkeit */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.02, 24]} />
        <meshStandardMaterial 
          color={hasProduct ? "#00D4AA" : "#666666"}
          transparent
          opacity={0.6}
          emissive={hasProduct ? "#008866" : "#333333"}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Zentrale Erhöhung */}
      {isSelected && (
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.15, 12, 8]} />
          <meshStandardMaterial 
            color="#00AAFF"
            transparent
            opacity={0.8}
            emissive="#0088CC"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
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
  // 📏 KAMERA-EINSTELLUNGEN - Hier können Sie die Entfernung anpassen
  const CAMERA_SETTINGS = {
    FIXED_DISTANCE: 6,        // Feste Entfernung zum Messpunkt (näher = 4-6, weiter = 8-12)
    ELEVATION_ANGLE: Math.PI / 8,   // 22.5° Erhöhung für optimale Sicht
    AZIMUTH_OFFSET: Math.PI / 4,    // 45° seitlicher Versatz
    // 🚀 ANIMATIONS-GESCHWINDIGKEIT
    ROTATION_DURATION: 0.6,   // Drehung zum Messpunkt (schneller = 0.4, langsamer = 1.0)
    MOVEMENT_DURATION: 1.2,   // Fahrt zum Messpunkt (schneller = 0.8, langsamer = 2.0)
  };

  const scene = sceneData?.scene;
  const measurePoints = sceneData?.measurePoints || [];
  const staticObjects = sceneData?.staticObjects || [];
  const [cameraTarget, setCameraTarget] = React.useState<[number, number, number] | undefined>();
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [orbitTarget, setOrbitTarget] = React.useState<[number, number, number]>([0, 0, 0]);
  const controlsRef = useRef<any>(null);

  // Kamera-Start-Position aus der Datenbank
  const cameraPosition: [number, number, number] = scene 
    ? [scene.CameraStartX, scene.CameraStartY, scene.CameraStartZ]
    : [0, 5, 10];

  // Reset camera to initial position
  const resetCamera = () => {
    console.log('🔄 Resetting camera to initial position:', cameraPosition);
    
    // Clear any current measure point target and move to initial position
    setCameraTarget(undefined);
    setIsAnimating(false);
    setOrbitTarget([0, 0, 0]);
    setTimeout(() => {
      setIsAnimating(true);
      setCameraTarget(cameraPosition);
    }, 100);
  };

  // Handle measure point click with camera movement - allow interrupting animations
  const handleMeasurePointClick = (measurePointId: string) => {
    console.log('🖱️ Measure point clicked:', measurePointId);
    console.log('🔍 Current animation state:', isAnimating);
    
    const measurePoint = measurePoints.find(mp => mp.Id.toString() === measurePointId);
    if (measurePoint) {
      const targetPos: [number, number, number] = [measurePoint.SpacePosX, measurePoint.SpacePosY, measurePoint.SpacePosZ];
      console.log('🎯 Setting camera target from click to:', targetPos);
      
      // Clear any existing state first
      setCameraTarget(undefined);
      setOrbitTarget([0, 0, 0]);
      setIsAnimating(false);
      
      // Set new state with small delay to ensure clean transition
      setTimeout(() => {
        setIsAnimating(true);
        setOrbitTarget(targetPos);
        setCameraTarget(targetPos);
        console.log('✅ Animation state set for measure point:', measurePointId);
      }, 50);
    }
    onMeasurePointClick?.(measurePointId);
  };

  // React to selectedMeasurePoint changes (from sidebar clicks) - allow interrupting
  React.useEffect(() => {
    console.log('🔍 selectedMeasurePoint changed:', selectedMeasurePoint);
    console.log('🔍 Current animation state:', isAnimating);
    
    if (selectedMeasurePoint) {
      const measurePoint = measurePoints.find(mp => mp.Id.toString() === selectedMeasurePoint);
      console.log('📍 Found measure point:', measurePoint);
      if (measurePoint) {
        const targetPos: [number, number, number] = [measurePoint.SpacePosX, measurePoint.SpacePosY, measurePoint.SpacePosZ];
        console.log('🎯 Setting camera target to:', targetPos);
        
        // Clear existing state first
        setCameraTarget(undefined);
        setOrbitTarget([0, 0, 0]);
        setIsAnimating(false);
        
        // Set new state with delay for clean transition
        setTimeout(() => {
          setIsAnimating(true);
          setOrbitTarget(targetPos);
          setCameraTarget(targetPos);
          console.log('✅ Animation state set from sidebar for:', selectedMeasurePoint);
        }, 50);
      } else {
        console.warn('❌ Measure point not found for ID:', selectedMeasurePoint);
      }
    } else {
      console.log('🚫 No measure point selected, clearing camera target');
      setCameraTarget(undefined);
      setIsAnimating(false);
      setOrbitTarget([0, 0, 0]);
    }
  }, [selectedMeasurePoint, measurePoints]); // Removed isAnimating from dependency array

  return (
    <div className="w-full h-full bg-slate-800 rounded-lg overflow-hidden">
      <Canvas
        camera={{ 
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        shadows
      >
        <Suspense fallback={<Loader />}>
          {/* Kamera-Controller für sanfte Bewegung */}
          <CameraController 
            targetPosition={cameraTarget}
            initialPosition={cameraPosition}
            cameraSettings={CAMERA_SETTINGS}
            onComplete={() => {
              console.log('🎬 Animation completed, cleaning up state');
              setCameraTarget(undefined);
              setIsAnimating(false);
              // Don't reset orbitTarget here - let it stay focused on the measure point
              console.log('✅ State cleanup complete, ready for next animation');
            }}
          />

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
              key={obj.id || `static-object-${index}`}
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
                  onClick={() => handleMeasurePointClick(measurePoint.Id.toString())}
                />

                {/* Konfigurierte Produkte */}
                {hasProduct && productUrl && (
                  <SikoraProductModel
                    url={productUrl.startsWith('/api/') ? productUrl : productUrl.startsWith('/') ? productUrl : `/api/assets/models/${productUrl}`}
                    position={[measurePoint.SpacePosX, measurePoint.SpacePosY, measurePoint.SpacePosZ]}
                    isSelected={isSelected}
                    onClick={() => handleMeasurePointClick(measurePoint.Id.toString())}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* Boden - jetzt auf Y=0 */}
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[80, 30]} />
            <meshStandardMaterial color="#f8f9fa" />
          </mesh>

          {/* Orbit Controls - Deaktiviert während Animationen */}
          <OrbitControls
            ref={controlsRef}
            enabled={!isAnimating}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            target={orbitTarget}
            maxPolarAngle={Math.PI / 2.1}
            minPolarAngle={0.1}
            minDistance={3}
            maxDistance={60}
            enableDamping={true}
            dampingFactor={0.1}
            screenSpacePanning={false}
            autoRotate={false}
            autoRotateSpeed={0}
          />
        </Suspense>
      </Canvas>

      {/* 3D-Kontrollen Overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
        <button
          onClick={() => controlsRef.current?.dollyIn(1.2)}
          className="text-white hover:text-sikora-cyan transition-colors duration-200 p-1 hover:bg-white/10 rounded"
          title="Hineinzoomen"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>
        <button
          onClick={() => controlsRef.current?.dollyOut(1.2)}
          className="text-white hover:text-sikora-cyan transition-colors duration-200 p-1 hover:bg-white/10 rounded"
          title="Herauszoomen"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        <button
          onClick={resetCamera}
          className="text-white hover:text-sikora-cyan transition-colors duration-200 p-1 hover:bg-white/10 rounded"
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