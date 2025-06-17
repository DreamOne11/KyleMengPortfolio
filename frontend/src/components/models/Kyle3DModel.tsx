import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

const ModelLoader: React.FC = () => {
  const { scene } = useGLTF('/Kyle3D.glb');
  return <primitive object={scene} scale={2.0} position={[0, -0.5, 0]} />;
};

const Kyle3DModel: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        <directionalLight position={[-10, -10, -5]} intensity={0.8} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={null}>
          <ModelLoader />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minZoom={0.5}
          maxZoom={3}
          autoRotate={true}
          autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  );
};

export default Kyle3DModel; 