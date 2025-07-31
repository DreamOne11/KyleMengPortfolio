import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useResponsive, getDevicePerformanceLevel } from '../../utils/responsive';

const ModelLoader: React.FC = () => {
  const { scene } = useGLTF('/Kyle3D.glb');
  return <primitive object={scene} scale={3.2} position={[0, -0.8, 0]} />;
};

const Kyle3DModel: React.FC = () => {
  const responsive = useResponsive();
  
  // 根据设备性能调整渲染质量
  const performanceSettings = useMemo(() => {
    const performanceLevel = getDevicePerformanceLevel();
    const isMobile = responsive.isMobile;
    
    return {
      autoRotateSpeed: isMobile ? 0.5 : performanceLevel === 'low' ? 0.5 : 1,
      lightIntensity: isMobile ? 0.8 : performanceLevel === 'low' ? 0.8 : 1.2,
      enableAutoRotate: !isMobile || performanceLevel !== 'low',
      pixelRatio: isMobile ? Math.min(window.devicePixelRatio, 1.5) : window.devicePixelRatio
    };
  }, [responsive.isMobile]);

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ 
          antialias: !responsive.isMobile
        }}
        dpr={performanceSettings.pixelRatio}
      >
        <ambientLight intensity={performanceSettings.lightIntensity} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={performanceSettings.lightIntensity * 1.67} 
        />
        <directionalLight 
          position={[-10, -10, -5]} 
          intensity={performanceSettings.lightIntensity * 0.67} 
        />
        <pointLight 
          position={[5, 5, 5]} 
          intensity={performanceSettings.lightIntensity * 0.83} 
        />
        <Suspense fallback={null}>
          <ModelLoader />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minZoom={0.8}
          maxZoom={2.5}
          autoRotate={performanceSettings.enableAutoRotate}
          autoRotateSpeed={performanceSettings.autoRotateSpeed}
        />
      </Canvas>
    </div>
  );
};

export default Kyle3DModel; 