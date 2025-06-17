import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// 定义 ShaderMaterial 的类型
interface CustomShaderMaterial extends THREE.ShaderMaterial {
    uniforms: {
        time: { value: number };
        mouse: { value: THREE.Vector2 };
        palette?: { value: number[] };
        resolution?: { value: THREE.Vector2 };
    };
}

// 添加 Navigator 接口扩展，以支持 deviceMemory 属性
interface NavigatorWithMemory extends Navigator {
    deviceMemory?: number;
}

// // 性能检测函数
// const detectPerformance = (): 'high' | 'medium' | 'low' => {
//     // 检测设备性能
//     const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
//     const isLowEndDevice = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : true;
//     const nav = navigator as NavigatorWithMemory;
//     const isLowMemory = nav.deviceMemory ? nav.deviceMemory <= 4 : false;
    
//     if (isMobile && (isLowEndDevice || isLowMemory)) {
//         return 'low';
//     } else if (isMobile || isLowEndDevice) {
//         return 'medium';
//     } else {
//         return 'high';
//     }
// };

const ParticleBackground: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const mainParticlesRef = useRef<THREE.Points | null>(null);
    const accentParticlesRef = useRef<THREE.Points | null>(null);
    const timeRef = useRef(0);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (!containerRef.current) return;

        // 保存对 containerRef.current 的引用
        const container = containerRef.current;

        // 初始化场景
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // 初始化相机
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 5;
        cameraRef.current = camera;

        // 初始化渲染器
        const renderer = new THREE.WebGLRenderer({ 
            alpha: true,
            antialias: true 
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0); // 完全透明背景
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // 创建粒子系统
        createMainParticles();
        createAccentParticles();

        // 事件监听
        const handleResize = () => {
            if (!cameraRef.current || !rendererRef.current) return;
            cameraRef.current.aspect = window.innerWidth / window.innerHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        };

        const handleMouseMove = (event: MouseEvent) => {
            mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        // 动画循环
        const animate = () => {
            requestAnimationFrame(animate);
            timeRef.current += 16;

            const mainParticles = mainParticlesRef.current;
            const accentParticles = accentParticlesRef.current;

            if (mainParticles?.material instanceof THREE.ShaderMaterial) {
                const material = mainParticles.material as CustomShaderMaterial;
                material.uniforms.time.value = timeRef.current;
                material.uniforms.mouse.value.set(
                    mouseRef.current.x,
                    mouseRef.current.y
                );
            }

            if (accentParticles?.material instanceof THREE.ShaderMaterial) {
                const material = accentParticles.material as CustomShaderMaterial;
                material.uniforms.time.value = timeRef.current;
            }

            if (cameraRef.current) {
                cameraRef.current.position.x = Math.sin(timeRef.current * 0.0002) * 0.1;
                cameraRef.current.position.y = Math.cos(timeRef.current * 0.00015) * 0.08;
            }

            renderer.render(scene, camera);
        };

        animate();

        // 清理函数
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    const createMainParticles = () => {
        if (!sceneRef.current) return;

        const particleCount = 15000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const phases = new Float32Array(particleCount);
        const colorIndices = new Float32Array(particleCount);

        // 均匀分配三种颜色
        for (let i = 0; i < particleCount; i++) {
            colorIndices[i] = i % 3;
        }

        // 均匀分布在大矩形区域
        const gridSize = Math.ceil(Math.sqrt(particleCount));
        const areaSize = 16.0; // 区域边长
        let idx = 0;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (idx >= particleCount) break;
                positions[idx * 3] = (i / gridSize - 0.5) * areaSize;
                positions[idx * 3 + 1] = (j / gridSize - 0.5) * areaSize;
                positions[idx * 3 + 2] = (Math.random() - 0.5) * 2.0; // z方向随机[-1,1]
                phases[idx] = Math.random() * Math.PI * 2;
                idx++;
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
        geometry.setAttribute('colorIndex', new THREE.BufferAttribute(colorIndices, 1));

        // 定义三种主色
        const palette = [
            new THREE.Color('#a78bfa'), // 紫
            new THREE.Color('#60a5fa'), // 蓝
            new THREE.Color('#f9a8d4')  // 粉
        ];

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                mouse: { value: new THREE.Vector2() },
                palette: { value: palette.flatMap(c => c.toArray().slice(0, 3)) }
            },
            vertexShader: `
                attribute float phase;
                attribute float colorIndex;
                uniform float time;
                uniform vec2 mouse;
                varying float vAlpha;
                varying float vColorIndex;
                void main() {
                    vec3 pos = position;
                    float t = time * 0.00004;
                    vec2 dir = normalize(vec2(-1.0, -1.0));
                    float areaSize = 16.0;
                    float speed = 2.0;
                    vec2 area = vec2(areaSize, areaSize);
                    vec2 offset = dir * t * speed;
                    vec2 p = pos.xy + offset;
                    p = mod(p + area * 0.5, area) - area * 0.5;
                    pos.xy = p;
                    pos.y += sin(pos.x * 0.7 + t * 2.0 + phase) * 0.18;
                    pos.x += cos(pos.y * 0.5 + t * 1.5 + phase) * 0.18;
                    float density = 0.4 + 0.6 * sin(pos.y * 1.2 + t * 0.8 + phase);
                    vAlpha = clamp(density, 0.15, 1.0) * 0.7;
                    vColorIndex = colorIndex;
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = 2.0 * (15.0 / -mvPosition.z);
                }
            `,
            fragmentShader: `
                uniform vec3 palette[3];
                varying float vAlpha;
                varying float vColorIndex;
                void main() {
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    if (dist > 0.5) discard;
                    // GLSL ES不支持动态索引，使用mix+step
                    vec3 c0 = palette[0];
                    vec3 c1 = palette[1];
                    vec3 c2 = palette[2];
                    vec3 color = c0;
                    color = mix(color, c1, step(0.5, vColorIndex));
                    color = mix(color, c2, step(1.5, vColorIndex));
                    float alpha = pow(1.0 - dist * 2.0, 2.0) * vAlpha * 1.2;
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        }) as CustomShaderMaterial;

        const particles = new THREE.Points(geometry, material);
        sceneRef.current.add(particles);
        mainParticlesRef.current = particles;
    };

    const createAccentParticles = () => {
        if (!sceneRef.current) return;

        const count = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const phases = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 25;
            positions[i3 + 1] = (Math.random() - 0.5) * 25;
            positions[i3 + 2] = (Math.random() - 0.5) * 12;
            phases[i] = Math.random() * Math.PI * 2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float phase;
                uniform float time;
                varying float vAlpha;
                
                void main() {
                    vec3 pos = position;
                    float t = time * 0.001;
                    
                    pos.x += sin(pos.y * 0.03 + t * 0.5 + phase) * 2.0;
                    pos.y += cos(pos.x * 0.025 + t * 0.3 + phase) * 1.5;
                    pos.z += sin((pos.x + pos.y) * 0.02 + t * 0.2 + phase) * 1.0;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    
                    gl_PointSize = 2.0;
                    
                    vAlpha = 0.5 + sin(t * 1.5 + phase) * 0.3;
                }
            `,
            fragmentShader: `
                varying float vAlpha;
                
                void main() {
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    
                    if (dist > 0.5) discard;
                    
                    float alpha = pow(1.0 - dist * 2.0, 2.0) * vAlpha * 1.2;
                    
                    vec3 color = vec3(0.13, 0.13, 0.13);
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        }) as CustomShaderMaterial;

        const particles = new THREE.Points(geometry, material);
        sceneRef.current.add(particles);
        accentParticlesRef.current = particles;
    };

    return (
        <div 
            ref={containerRef} 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 0,
                pointerEvents: 'none'
            }}
        />
    );
};

export default ParticleBackground; 