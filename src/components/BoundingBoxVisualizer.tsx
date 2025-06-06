import React, { useEffect, useState, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useLanguage } from '../contexts/LanguageContext';
import * as THREE from 'three';

interface BoundingBoxVisualizerProps {
  targetObject: THREE.Object3D | null;
  visible: boolean;
  color?: string;
  lineWidth?: number;
}

const BoundingBoxVisualizer: React.FC<BoundingBoxVisualizerProps> = ({
  targetObject,
  visible,
  color = '#003A62', // SIKORA Blue
  lineWidth = 2
}) => {
  const { scene } = useThree();
  const { t } = useLanguage();
  const [boundingBox, setBoundingBox] = useState<THREE.Box3 | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number; depth: number } | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!targetObject || !visible) {
      setBoundingBox(null);
      setDimensions(null);
      return;
    }

    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(targetObject);
    setBoundingBox(box);

    // Calculate dimensions in real-world units (assuming 1 unit = 1m, convert to cm)
    const size = box.getSize(new THREE.Vector3());
    setDimensions({
      width: Math.round(size.x * 100 * 10) / 10, // Convert to cm, round to 1 decimal
      height: Math.round(size.y * 100 * 10) / 10,
      depth: Math.round(size.z * 100 * 10) / 10
    });
  }, [targetObject, visible]);

  if (!visible || !boundingBox || !dimensions) {
    return null;
  }

  const min = boundingBox.min;
  const max = boundingBox.max;
  const center = boundingBox.getCenter(new THREE.Vector3());

  // Create wireframe box edges
  const createBoxLines = () => {
    const geometry = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(
        max.x - min.x,
        max.y - min.y,
        max.z - min.z
      )
    );

    return (
      <lineSegments position={[center.x, center.y, center.z]}>
        <primitive object={geometry} />
        <lineBasicMaterial color={color} linewidth={lineWidth} />
      </lineSegments>
    );
  };

  // Create labels directly on the bounding box edges
  const createEdgeLabels = () => {
    return (
      <group>
        {/* Width label (X-axis) - Bottom front edge */}
        <Html position={[center.x, min.y, max.z + 0.1]}>
          <div className="bg-sikora-blue/95 backdrop-blur-sm text-white px-2 py-1 rounded-md shadow-lg text-xs font-semibold border border-sikora-cyan/30">
            <div className="text-center">
              <div className="text-sikora-cyan text-xs">{t('width', 'Breite', 'Width')}</div>
              <div className="font-mono">{dimensions.width} cm</div>
            </div>
          </div>
        </Html>

        {/* Height label (Y-axis) - Left front edge */}
        <Html position={[min.x - 0.1, center.y, max.z + 0.1]}>
          <div className="bg-sikora-blue/95 backdrop-blur-sm text-white px-2 py-1 rounded-md shadow-lg text-xs font-semibold border border-sikora-cyan/30">
            <div className="text-center">
              <div className="text-sikora-cyan text-xs">{t('height', 'Höhe', 'Height')}</div>
              <div className="font-mono">{dimensions.height} cm</div>
            </div>
          </div>
        </Html>

        {/* Depth label (Z-axis) - Bottom right edge */}
        <Html position={[max.x + 0.1, min.y, center.z]}>
          <div className="bg-sikora-blue/95 backdrop-blur-sm text-white px-2 py-1 rounded-md shadow-lg text-xs font-semibold border border-sikora-cyan/30">
            <div className="text-center">
              <div className="text-sikora-cyan text-xs">{t('depth', 'Tiefe', 'Depth')}</div>
              <div className="font-mono">{dimensions.depth} cm</div>
            </div>
          </div>
        </Html>

        {/* Summary dimensions box */}
        <Html position={[max.x + 0.3, max.y, max.z + 0.3]}>
          <div className="bg-sikora-blue/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-lg border border-sikora-cyan/30">
            <div className="text-xs font-semibold mb-1 text-sikora-cyan">{t('dimensions', 'Abmessungen', 'Dimensions')}</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-white/80">{t('widthShort', 'B:', 'W:')}</span>
                <span className="font-mono font-semibold">{dimensions.width} cm</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-white/80">{t('heightShort', 'H:', 'H:')}</span>
                <span className="font-mono font-semibold">{dimensions.height} cm</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-white/80">{t('depthShort', 'T:', 'D:')}</span>
                <span className="font-mono font-semibold">{dimensions.depth} cm</span>
              </div>
            </div>
          </div>
        </Html>
      </group>
    );
  };

  return (
    <group ref={groupRef}>
      {createBoxLines()}
      {createEdgeLabels()}
    </group>
  );
};

export default BoundingBoxVisualizer;
