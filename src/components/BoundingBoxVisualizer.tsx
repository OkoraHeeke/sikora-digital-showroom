import React, { useEffect, useState, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
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

  // Create dimension lines with measurements
  const createDimensionLines = () => {
    const offset = 0.3; // Distance from the bounding box
    const lineExtension = 0.1;

    return (
      <group>
        {/* Width measurement (X-axis) */}
        <group>
          {/* Dimension line */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  min.x, min.y - offset, center.z,
                  max.x, min.y - offset, center.z
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color={color} linewidth={lineWidth} />
          </line>

          {/* Extension lines */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={4}
                array={new Float32Array([
                  min.x, min.y - offset - lineExtension, center.z,
                  min.x, min.y - offset + lineExtension, center.z,
                  max.x, min.y - offset - lineExtension, center.z,
                  max.x, min.y - offset + lineExtension, center.z
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color={color} linewidth={lineWidth} />
          </line>

          {/* Width label */}
          <Html position={[center.x, min.y - offset - 0.2, center.z]}>
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-sikora-blue/20">
              <span className="text-sm font-semibold text-sikora-blue">
                {dimensions.width} cm
              </span>
            </div>
          </Html>
        </group>

        {/* Height measurement (Y-axis) */}
        <group>
          {/* Dimension line */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  min.x - offset, min.y, center.z,
                  min.x - offset, max.y, center.z
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color={color} linewidth={lineWidth} />
          </line>

          {/* Extension lines */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={4}
                array={new Float32Array([
                  min.x - offset - lineExtension, min.y, center.z,
                  min.x - offset + lineExtension, min.y, center.z,
                  min.x - offset - lineExtension, max.y, center.z,
                  min.x - offset + lineExtension, max.y, center.z
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color={color} linewidth={lineWidth} />
          </line>

          {/* Height label */}
          <Html position={[min.x - offset - 0.2, center.y, center.z]}>
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-sikora-blue/20">
              <span className="text-sm font-semibold text-sikora-blue">
                {dimensions.height} cm
              </span>
            </div>
          </Html>
        </group>

        {/* Depth measurement (Z-axis) */}
        <group>
          {/* Dimension line */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  center.x, min.y - offset, min.z,
                  center.x, min.y - offset, max.z
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color={color} linewidth={lineWidth} />
          </line>

          {/* Extension lines */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={4}
                array={new Float32Array([
                  center.x - lineExtension, min.y - offset, min.z,
                  center.x + lineExtension, min.y - offset, min.z,
                  center.x - lineExtension, min.y - offset, max.z,
                  center.x + lineExtension, min.y - offset, max.z
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color={color} linewidth={lineWidth} />
          </line>

          {/* Depth label */}
          <Html position={[center.x, min.y - offset - 0.2, center.z]}>
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-sikora-blue/20">
              <span className="text-sm font-semibold text-sikora-blue">
                {dimensions.depth} cm
              </span>
            </div>
          </Html>
        </group>

        {/* Summary dimensions box */}
        <Html position={[max.x + 0.5, max.y, center.z]}>
          <div className="bg-sikora-blue/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-lg border border-sikora-cyan/30">
            <div className="text-xs font-semibold mb-1 text-sikora-cyan">Abmessungen</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-white/80">Breite:</span>
                <span className="font-mono font-semibold">{dimensions.width} cm</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-white/80">Höhe:</span>
                <span className="font-mono font-semibold">{dimensions.height} cm</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-white/80">Tiefe:</span>
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
      {createDimensionLines()}
    </group>
  );
};

export default BoundingBoxVisualizer;
