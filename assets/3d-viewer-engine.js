import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// Vignette shader
const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 0.05 },
    darkness: { value: 0.2 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
      float vignette = 1.0 - dot(uv, uv);
      texel.rgb *= mix(1.0, vignette, darkness);
      gl_FragColor = texel;
    }
  `
};

export class ThreeViewer {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.config = {
      bgColor: config.bgColor || '#F8F7F5',
      autoRotate: config.autoRotate !== false,
      rotationSpeed: config.rotationSpeed || 4,
      rotationDelay: config.rotationDelay || 3000,
      cameraControls: config.cameraControls !== false,
      exposure: config.exposure || 1.2,
      hdrUrl: config.hdrUrl || '',
      bloomIntensity: config.bloomIntensity != null ? config.bloomIntensity : 0.3,
      onLoad: config.onLoad || null
    };

    this._animationId = null;
    this._currentModel = null;
    this._disposed = false;
    this._autoRotateTimer = null;

    this._initRenderer();
    this._initScene();
    this._initCamera();
    this._initControls();
    this._initLighting();
    this._initPostProcessing();
    this._loadEnvironment();
    this._initLoader();
    this._bindEvents();
    this._animate();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = this.config.exposure;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const bg = new THREE.Color(this.config.bgColor);
    this.renderer.setClearColor(bg, 1);
  }

  _initScene() {
    this.scene = new THREE.Scene();
  }

  _initCamera() {
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 1000);
    this.camera.position.set(0, 2, 5);
  }

  _initControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = false;
    this.controls.enableZoom = this.config.cameraControls;
    this.controls.enableRotate = this.config.cameraControls;
    this.controls.autoRotate = this.config.autoRotate;
    this.controls.autoRotateSpeed = this.config.rotationSpeed;
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 20;

    // Pause auto-rotate on interaction, resume after delay
    if (this.config.autoRotate && this.config.rotationDelay > 0) {
      const pauseRotation = () => {
        this.controls.autoRotate = false;
        clearTimeout(this._autoRotateTimer);
        this._autoRotateTimer = setTimeout(() => {
          if (!this._disposed) this.controls.autoRotate = true;
        }, this.config.rotationDelay);
      };
      this.canvas.addEventListener('pointerdown', pauseRotation);
      this.canvas.addEventListener('wheel', pauseRotation);
      this._pauseRotation = pauseRotation;
    }
  }

  _initLighting() {
    // Key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2);
    keyLight.position.set(10, 10, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.radius = 4;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0xc2d0ff, 1);
    fillLight.position.set(-5, 5, 5);
    this.scene.add(fillLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0xffe0d0, 1.5);
    rimLight.position.set(0, 5, -10);
    this.scene.add(rimLight);

    // Ambient
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // Point lights for glass sparkle
    const sparkle1 = new THREE.PointLight(0xffffff, 3, 30, 2);
    sparkle1.position.set(5, 8, 5);
    this.scene.add(sparkle1);

    const sparkle2 = new THREE.PointLight(0xf0f0ff, 2, 25, 2);
    sparkle2.position.set(-4, 6, -3);
    this.scene.add(sparkle2);

    const sparkle3 = new THREE.PointLight(0xfff5f0, 1.5, 20, 2);
    sparkle3.position.set(2, -2, 8);
    this.scene.add(sparkle3);
  }

  _initPostProcessing() {
    const size = new THREE.Vector2(this.canvas.clientWidth, this.canvas.clientHeight);
    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    if (this.config.bloomIntensity > 0) {
      this.bloomPass = new UnrealBloomPass(size, this.config.bloomIntensity, 0.8, 0.25);
      this.composer.addPass(this.bloomPass);
    }

    const vignettePass = new ShaderPass(VignetteShader);
    this.composer.addPass(vignettePass);
  }

  _loadEnvironment() {
    if (!this.config.hdrUrl) return;

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    const rgbeLoader = new RGBELoader();
    rgbeLoader.load(
      this.config.hdrUrl,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        this.scene.environment = envMap;
        texture.dispose();
        pmremGenerator.dispose();
      },
      undefined,
      (err) => {
        console.warn('Failed to load HDR environment:', err);
        pmremGenerator.dispose();
      }
    );
  }

  _initLoader() {
    this.gltfLoader = new GLTFLoader();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.gltfLoader.setDRACOLoader(dracoLoader);
  }

  _bindEvents() {
    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);

    // ResizeObserver for container size changes
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => this.resize());
      this._resizeObserver.observe(this.canvas.parentElement);
    }
  }

  _enhanceMaterials(scene) {
    let meshCount = 0;

    scene.traverse((node) => {
      if (!node.isMesh) return;
      meshCount++;

      node.castShadow = meshCount < 20;
      node.receiveShadow = true;

      const materials = Array.isArray(node.material) ? node.material : [node.material];

      materials.forEach((mat) => {
        if (!mat) return;

        // Transmissive materials (glass, liquid)
        if (mat.isMeshPhysicalMaterial && mat.transmission > 0) {
          mat.side = THREE.DoubleSide;
          mat.thickness = Math.max(mat.thickness || 0, 0.5);
          mat.roughness = Math.min(mat.roughness, 0.1);
          mat.envMapIntensity = 2.0;
          mat.needsUpdate = true;
          return;
        }

        // Standard PBR materials
        if (mat.isMeshStandardMaterial) {
          mat.side = THREE.DoubleSide;

          if (mat.map) {
            mat.map.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
            mat.map.needsUpdate = true;
          }

          if (!mat.roughnessMap && mat.roughness === 1) {
            mat.roughness = 0.5;
          }

          mat.needsUpdate = true;
        }
      });
    });
  }

  _frameModel(scene) {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    if (size.x === 0 && size.y === 0 && size.z === 0) return;

    // Center the model
    scene.position.sub(center);

    // Calculate camera distance to fit model
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    const radius = sphere.radius;

    const fov = this.camera.fov * (Math.PI / 180);
    const distance = (radius / Math.sin(fov / 2)) * 1.05;

    const direction = this.camera.position.clone().normalize();
    if (direction.length() === 0) direction.set(0, 0.5, 1).normalize();
    this.camera.position.copy(direction.multiplyScalar(distance));
    this.camera.lookAt(0, 0, 0);

    this.controls.target.set(0, 0, 0);
    this.controls.minDistance = Math.max(radius * 0.5, 0.1);
    this.controls.maxDistance = radius * 5;
    this.controls.update();
  }

  loadModel(url) {
    if (!url) return Promise.reject(new Error('No URL provided'));

    // Remove previous model
    if (this._currentModel) {
      this.scene.remove(this._currentModel);
      this._currentModel.traverse((node) => {
        if (node.isMesh) {
          node.geometry?.dispose();
          const mats = Array.isArray(node.material) ? node.material : [node.material];
          mats.forEach((m) => {
            if (!m) return;
            Object.values(m).forEach((v) => {
              if (v && typeof v.dispose === 'function') v.dispose();
            });
            m.dispose();
          });
        }
      });
      this._currentModel = null;
    }

    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          this._enhanceMaterials(model);
          this.scene.add(model);
          this._currentModel = model;
          this._frameModel(model);

          if (this.config.onLoad) this.config.onLoad();
          resolve(model);
        },
        undefined,
        (err) => {
          console.error('Failed to load model:', err);
          reject(err);
        }
      );
    });
  }

  resize() {
    const container = this.canvas.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);

    if (this.bloomPass) {
      this.bloomPass.resolution.set(width, height);
    }
  }

  _animate() {
    if (this._disposed) return;
    this._animationId = requestAnimationFrame(() => this._animate());
    this.controls.update();
    this.composer.render();
  }

  dispose() {
    this._disposed = true;

    if (this._animationId) {
      cancelAnimationFrame(this._animationId);
    }

    clearTimeout(this._autoRotateTimer);

    window.removeEventListener('resize', this._onResize);

    if (this._pauseRotation) {
      this.canvas.removeEventListener('pointerdown', this._pauseRotation);
      this.canvas.removeEventListener('wheel', this._pauseRotation);
    }

    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }

    // Dispose model
    if (this._currentModel) {
      this._currentModel.traverse((node) => {
        if (node.isMesh) {
          node.geometry?.dispose();
          const mats = Array.isArray(node.material) ? node.material : [node.material];
          mats.forEach((m) => {
            if (!m) return;
            Object.values(m).forEach((v) => {
              if (v && typeof v.dispose === 'function') v.dispose();
            });
            m.dispose();
          });
        }
      });
    }

    // Dispose environment
    if (this.scene.environment) {
      this.scene.environment.dispose();
    }

    // Dispose post-processing
    this.composer.dispose();

    // Dispose controls and renderer
    this.controls.dispose();
    this.renderer.dispose();
  }
}
