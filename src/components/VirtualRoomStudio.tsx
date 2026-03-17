import {
  Component,
  type ErrorInfo,
  type ReactNode,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  OrbitControls,
  useGLTF,
  useTexture,
} from '@react-three/drei';
import {
  ACESFilmicToneMapping,
  Box3,
  Group,
  Material,
  Mesh,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  Vector2,
  Vector3,
} from 'three';
import gsap from 'gsap';
import {
  ArrowRight,
  Camera,
  Check,
  Eye,
  Focus,
  Image as ImageIcon,
  RotateCcw,
  RotateCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { parseTileSize, resolveProductImage } from '@/lib/productMedia';
import { cn } from '@/lib/utils';

/* ─────────────────────────── Types ─────────────────────────── */

type CoverageMode = 'floor' | 'wall' | 'both';

type CatalogProduct = {
  id: string | number;
  name: string;
  category: 'porcellanato' | 'ceramic';
  size: string;
  image?: string | null;
  brand?: string | null;
  price?: number | string;
  stock: number;
  description?: string | null;
};

type SceneConfig = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  image: string;
  model: string;
  suggestedCoverage: CoverageMode;
  accent: string;
  background: string;
  lightColor: string;
  floorTargets: string[];
  wallTargets: string[];
  hiddenWhenFloor?: string[];
  /** Meshes always hidden for cutaway interior view */
  hiddenMeshes?: string[];
  normalizedSize: number;
  /** Approximate physical surface dimensions in meters for auto tile repeat */
  surfaceSize: {
    floor: [number, number];
    wall: [number, number];
  };
};

type CameraPresetId = 'wide' | 'wall' | 'detail' | 'closeup';

type CameraPreset = {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
};

type ModelRoomProps = {
  config: SceneConfig;
  textureUrl: string;
  coverage: CoverageMode;
  tileWidthM: number;
  tileHeightM: number;
  rotated: boolean;
  cameraPreset: CameraPresetId;
};

/* ─────────────────────────── Constants ─────────────────────── */

/* ─────────── Custom Ceramic Shader Fragment ─────────── */

/**
 * Replaces Three.js #include <map_fragment> with:
 * 1. Anti-repetition: random mirror per tile to break obvious pattern
 * 2. Grout lines: procedural grout between tiles with soft edges
 * 3. Edge bevel: subtle darkening near grout for depth illusion
 */
const CERAMIC_MAP_FRAGMENT = /* glsl */ `
#ifdef USE_MAP
    // Tile coordinates from transformed UV (repeat already applied by Three.js)
    vec2 tileIdx = floor(vMapUv);
    vec2 localUv = fract(vMapUv);

    // ── Anti-repetition: random mirror per tile (4 variations) ──
    float h1 = fract(sin(dot(tileIdx, vec2(127.1, 311.7))) * 43758.5453);
    float h2 = fract(sin(dot(tileIdx, vec2(269.5, 183.3))) * 43758.5453);
    vec2 sampleUv = localUv;
    sampleUv.x = mix(sampleUv.x, 1.0 - sampleUv.x, step(0.5, h1));
    sampleUv.y = mix(sampleUv.y, 1.0 - sampleUv.y, step(0.5, h2));

    // Sample tile texture with mirrored UV
    vec4 sampledDiffuseColor = texture2D(map, sampleUv);

    // ── Grout lines ──
    float distX = min(localUv.x, 1.0 - localUv.x);
    float distY = min(localUv.y, 1.0 - localUv.y);
    float fwX = fwidth(localUv.x);
    float fwY = fwidth(localUv.y);
    float softX = max(0.003, fwX * 1.5);
    float softY = max(0.003, fwY * 1.5);
    float gx = smoothstep(uGroutWidth.x * 0.5 - softX, uGroutWidth.x * 0.5 + softX, distX);
    float gy = smoothstep(uGroutWidth.y * 0.5 - softY, uGroutWidth.y * 0.5 + softY, distY);
    float tileMask = gx * gy;

    // Apply grout color where tileMask is 0
    sampledDiffuseColor.rgb = mix(uGroutColor, sampledDiffuseColor.rgb, tileMask);

    // ── Edge bevel: subtle shadow near grout for depth ──
    float bevelSoft = 0.025;
    float bx = smoothstep(uGroutWidth.x * 0.5, uGroutWidth.x * 0.5 + bevelSoft, distX);
    float by = smoothstep(uGroutWidth.y * 0.5, uGroutWidth.y * 0.5 + bevelSoft, distY);
    sampledDiffuseColor.rgb *= 0.97 + 0.03 * bx * by;

    diffuseColor *= sampledDiffuseColor;
#endif
`;

const PLACEHOLDER_TEXTURE = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <rect width="24" height="24" fill="#d9ded4" />
    <path d="M0 12h24M12 0v24" stroke="#bcc5b6" stroke-width="1" />
  </svg>
`)}`;

const ROOM_SCENES: SceneConfig[] = [
  {
    id: 'office-studio',
    name: 'Office Studio',
    eyebrow: 'Minimal office',
    description: 'Scene 3D kantor clean untuk simulasi ruang kerja, co-working, dan meeting compact.',
    image: '/visualizer-scenes/05-work-studio.jpeg',
    model: '/virtual-room-models/minimalistic_modern_office/scene.gltf',
    suggestedCoverage: 'floor',
    accent: '#7a8ca3',
    background: '#edf3f8',
    lightColor: '#eef7ff',
    floorTargets: ['structure'],
    wallTargets: ['background'],
    hiddenWhenFloor: ['carpet'],
    normalizedSize: 6.4,
    surfaceSize: { floor: [3.5, 3.5], wall: [3.1, 2.5] },
  },
  {
    id: 'spa-bath',
    name: 'Spa Bath',
    eyebrow: 'Modern bathroom',
    description: 'Cocok untuk visual kamar mandi, powder room, dan area spa dengan wall cladding keramik.',
    image: '/visualizer-scenes/09-spa-bath.jpeg',
    model: '/virtual-room-models/modern_bathroom/scene.gltf',
    suggestedCoverage: 'both',
    accent: '#88a4ac',
    background: '#eaf1f2',
    lightColor: '#f3fdff',
    floorTargets: ['structure'],
    wallTargets: ['backdrop'],
    hiddenWhenFloor: ['carpet', 'toiletrug'],
    normalizedSize: 6.2,
    surfaceSize: { floor: [3.1, 3.1], wall: [2.9, 2.5] },
  },
  {
    id: 'calm-bedroom',
    name: 'Calm Bedroom',
    eyebrow: 'Modern bedroom',
    description: 'Preview suite bedroom yang hangat untuk dinding aksen dan mood residensial premium.',
    image: '/visualizer-scenes/08-calm-bedroom.jpeg',
    model: '/virtual-room-models/modern_bedroom/scene.gltf',
    suggestedCoverage: 'wall',
    accent: '#ab9473',
    background: '#f3ece3',
    lightColor: '#fff2df',
    floorTargets: ['carpet'],
    wallTargets: ['structure'],
    normalizedSize: 6,
    surfaceSize: { floor: [3.2, 3.2], wall: [2.9, 2.4] },
  },
  {
    id: 'living-gallery',
    name: 'Living Gallery',
    eyebrow: 'Living room',
    description: 'Scene ruang keluarga yang paling kuat untuk menilai keramik lantai dan dinding secara bersamaan.',
    image: '/visualizer-scenes/10-living-gallery.jpeg',
    model: '/virtual-room-models/simple_modern_living_room/scene.gltf',
    suggestedCoverage: 'both',
    accent: '#8b7864',
    background: '#efe7de',
    lightColor: '#fff0da',
    floorTargets: ['floor', 'planks'],
    wallTargets: ['walls'],
    hiddenWhenFloor: ['carpet'],
    hiddenMeshes: ['frame', 'lights', 'backdrop', 'door'],
    normalizedSize: 6.6,
    surfaceSize: { floor: [3.7, 3.7], wall: [3.0, 2.4] },
  },
  {
    id: 'brick-cafe',
    name: 'Brick Cafe',
    eyebrow: 'Small cafe',
    description: 'Pilihan terbaik untuk cafe kecil, coffee corner, dan proyek hospitality yang butuh floor keramik tegas.',
    image: '/visualizer-scenes/06-brick-cafe.jpeg',
    model: '/virtual-room-models/small_cafe/scene.gltf',
    suggestedCoverage: 'floor',
    accent: '#a06645',
    background: '#efe5dd',
    lightColor: '#ffead3',
    floorTargets: ['structure'],
    wallTargets: ['structure'],
    normalizedSize: 6.8,
    surfaceSize: { floor: [4.0, 4.0], wall: [3.2, 2.5] },
  },
  {
    id: 'clean-kitchen',
    name: 'Clean Kitchen',
    eyebrow: 'Modern kitchen',
    description: 'Scene dapur modern untuk backsplash, floor tile, dan area servis rumah yang lebih realistis.',
    image: '/visualizer-scenes/07-clean-kitchen.jpeg',
    model: '/virtual-room-models/small_modern_kitchen/scene.gltf',
    suggestedCoverage: 'wall',
    accent: '#7d8591',
    background: '#eef1f4',
    lightColor: '#f8fbff',
    floorTargets: ['structure'],
    wallTargets: ['structure'],
    normalizedSize: 6.6,
    surfaceSize: { floor: [3.5, 3.5], wall: [3.1, 2.5] },
  },
];

/* ────────────────────── Utility Functions ──────────────────── */

function formatPrice(price?: number | string) {
  if (price === undefined || price === null || price === '') return 'Harga konsultasi';
  const normalized = Number(price);
  if (Number.isNaN(normalized)) return 'Harga konsultasi';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(normalized);
}

function getSuggestedCoverage(size: string, scene: SceneConfig) {
  const normalized = size.toLowerCase();
  if (normalized.startsWith('20x') || normalized.startsWith('25x')) return 'wall' as CoverageMode;
  if (normalized.includes('120')) return 'both' as CoverageMode;
  return scene.suggestedCoverage;
}

function buildWhatsAppLink(product: CatalogProduct, scene: SceneConfig) {
  const text = encodeURIComponent(
    `Halo IKAD, saya tertarik dengan produk ${product.name} ukuran ${product.size} dan ingin konsultasi virtual room 3D scene ${scene.name}.`,
  );
  return `https://wa.me/6285261738861?text=${text}`;
}

function matchesKeywords(label: string, keywords: string[]) {
  return keywords.some((keyword) => label.includes(keyword));
}

/**
 * Auto-calculate tile repeat count for a given surface.
 */
function calculateTileRepeat(
  surfaceSizeM: [number, number],
  tileWidthM: number,
  tileHeightM: number,
): [number, number] {
  const repeatX = Math.max(1, surfaceSizeM[0] / tileWidthM);
  const repeatY = Math.max(1, surfaceSizeM[1] / tileHeightM);
  return [repeatX, repeatY];
}

/** Grout width in meters (2.5mm) */
const GROUT_WIDTH_M = 0.0025;

/**
 * Create a PBR MeshStandardMaterial with ceramic grout shader injected.
 * Grout uniforms are stored in material.userData for later updates.
 */
function createTileMaterial(type: 'floor' | 'wall'): MeshStandardMaterial {
  const groutColorUniform = { value: new Vector3(0.82, 0.81, 0.79) };
  const groutWidthUniform = { value: new Vector2(0.012, 0.012) };

  const mat = new MeshStandardMaterial({
    color: '#ffffff',
    roughness: type === 'floor' ? 0.45 : 0.55,
    metalness: 0,
    envMapIntensity: type === 'floor' ? 0.5 : 0.25,
  });

  // Store uniform refs so we can update grout width when tile size changes
  mat.userData.groutColorUniform = groutColorUniform;
  mat.userData.groutWidthUniform = groutWidthUniform;

  mat.onBeforeCompile = (shader) => {
    // Inject grout uniforms
    shader.uniforms.uGroutColor = groutColorUniform;
    shader.uniforms.uGroutWidth = groutWidthUniform;

    // Add uniform declarations to fragment shader
    shader.fragmentShader = shader.fragmentShader.replace(
      'void main() {',
      `uniform vec3 uGroutColor;
      uniform vec2 uGroutWidth;
      void main() {`,
    );

    // Replace map sampling with ceramic grout + anti-repetition shader
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      CERAMIC_MAP_FRAGMENT,
    );
  };

  return mat;
}

/**
 * Update the grout width uniforms on a ceramic material based on tile dimensions.
 */
function updateGroutUniforms(
  material: MeshStandardMaterial,
  tileWidthM: number,
  tileHeightM: number,
) {
  const uniform = material.userData.groutWidthUniform as { value: Vector2 } | undefined;
  if (uniform) {
    uniform.value.set(
      GROUT_WIDTH_M / tileWidthM,
      GROUT_WIDTH_M / tileHeightM,
    );
  }
}

/* ──────────────── Texture Hook (auto-repeat) ──────────────── */

function useAutoTileTexture(
  source: string,
  surfaceSizeM: [number, number],
  tileWidthM: number,
  tileHeightM: number,
) {
  const baseTexture = useTexture(source || PLACEHOLDER_TEXTURE);
  const texture = useMemo(() => baseTexture.clone(), [baseTexture]);

  useEffect(() => {
    const [repeatX, repeatY] = calculateTileRepeat(surfaceSizeM, tileWidthM, tileHeightM);

    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.anisotropy = 16;
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
  }, [surfaceSizeM, tileWidthM, tileHeightM, texture]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/* ──────────────── Error Boundary ──────────────────────────── */

type ThreePreviewBoundaryProps = { children: ReactNode };
type ThreePreviewBoundaryState = { hasError: boolean };

class ThreePreviewBoundary extends Component<
  ThreePreviewBoundaryProps,
  ThreePreviewBoundaryState
> {
  state: ThreePreviewBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Virtual room preview failed to render.', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef2f7_100%)] p-6 text-center">
          <div className="max-w-md rounded-[28px] border border-slate-200 bg-white/94 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-700">
              <ImageIcon className="h-6 w-6" />
            </div>
            <h4 className="mt-4 text-lg font-bold text-slate-900">Viewer 3D sedang dipulihkan</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Scene 3D gagal dimuat penuh. Refresh sekali lagi, atau ganti ke scene lain dulu.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* ──────────────── Scene Model ─────────────────────────────── */

function SceneModel({
  config,
  textureUrl,
  coverage,
  tileWidthM,
  tileHeightM,
}: ModelRoomProps) {
  const gltf = useGLTF(config.model) as { scene: Group };

  /* Auto-computed textures for floor & wall */
  const floorTexture = useAutoTileTexture(
    textureUrl,
    config.surfaceSize.floor,
    tileWidthM,
    tileHeightM,
  );
  const wallTexture = useAutoTileTexture(
    textureUrl,
    config.surfaceSize.wall,
    tileWidthM,
    tileHeightM,
  );

  /* PBR ceramic materials with grout shader */
  const floorMaterial = useMemo(() => createTileMaterial('floor'), []);
  const wallMaterial = useMemo(() => createTileMaterial('wall'), []);

  useEffect(() => {
    floorMaterial.map = floorTexture;
    floorMaterial.needsUpdate = true;
  }, [floorMaterial, floorTexture]);

  useEffect(() => {
    wallMaterial.map = wallTexture;
    wallMaterial.needsUpdate = true;
  }, [wallMaterial, wallTexture]);

  /* Update grout width when tile dimensions change */
  useEffect(() => {
    updateGroutUniforms(floorMaterial, tileWidthM, tileHeightM);
    updateGroutUniforms(wallMaterial, tileWidthM, tileHeightM);
  }, [floorMaterial, wallMaterial, tileWidthM, tileHeightM]);

  useEffect(
    () => () => {
      floorMaterial.dispose();
      wallMaterial.dispose();
    },
    [floorMaterial, wallMaterial],
  );

  /* Clone & normalize scene */
  const preparedScene = useMemo(() => {
    const cloned = gltf.scene.clone(true);

    cloned.traverse((child) => {
      if (!(child instanceof Mesh)) return;

      const originalMaterial = Array.isArray(child.material)
        ? child.material.map((material) => material.clone())
        : child.material.clone();

      child.castShadow = true;
      child.receiveShadow = true;
      child.userData.originalMaterial = originalMaterial;
      child.userData.originalVisible = child.visible;
      child.userData.surfaceLabel = `${child.name} ${
        Array.isArray(originalMaterial)
          ? originalMaterial.map((material) => material.name).join(' ')
          : originalMaterial.name
      }`.toLowerCase();
    });

    const bounds = new Box3().setFromObject(cloned);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const scale = config.normalizedSize / maxDimension;

    cloned.position.sub(center);
    cloned.scale.setScalar(scale);

    const scaledBounds = new Box3().setFromObject(cloned);
    cloned.position.y -= scaledBounds.min.y;

    return cloned;
  }, [config.normalizedSize, gltf.scene]);

  /* Apply tile material to matching surfaces */
  useEffect(() => {
    const floorEnabled = coverage === 'floor' || coverage === 'both';
    const wallEnabled = coverage === 'wall' || coverage === 'both';

    preparedScene.traverse((child) => {
      if (!(child instanceof Mesh)) return;

      const originals = child.userData.originalMaterial as Material | Material[];
      const surfaceLabel = String(child.userData.surfaceLabel ?? child.name).toLowerCase();
      const hideForFloor =
        floorEnabled &&
        matchesKeywords(surfaceLabel, config.hiddenWhenFloor ?? []);
      const hideCutaway = matchesKeywords(surfaceLabel, config.hiddenMeshes ?? []);

      child.visible = Boolean(child.userData.originalVisible) && !hideForFloor && !hideCutaway;

      const originalList = Array.isArray(originals) ? originals : [originals];
      const nextMaterials = originalList.map((material) => {
        const materialLabel = `${surfaceLabel} ${material.name ?? ''}`.toLowerCase();
        if (floorEnabled && matchesKeywords(materialLabel, config.floorTargets)) return floorMaterial;
        if (wallEnabled && matchesKeywords(materialLabel, config.wallTargets)) return wallMaterial;
        return material;
      });

      child.material = Array.isArray(originals) ? nextMaterials : nextMaterials[0];
    });
  }, [
    config.floorTargets,
    config.hiddenWhenFloor,
    config.hiddenMeshes,
    config.wallTargets,
    coverage,
    floorMaterial,
    preparedScene,
    wallMaterial,
  ]);

  return <primitive object={preparedScene} />;
}

/* ────────────── Camera Presets ────────────────────── */

const CAMERA_PRESETS: Record<CameraPresetId, CameraPreset> = {
  wide:    { position: [2.0, 2.8, 2.6],  target: [-0.5, 2.0, 0],  fov: 60 },
  wall:    { position: [1.6, 2.6, 2.6],  target: [-0.4, 2.4, 0],  fov: 50 },
  detail:  { position: [1.6, 2.5, 2.5],  target: [-0.2, 2.4, 0],  fov: 44 },
  closeup: { position: [1.2, 2.5, 2.0],  target: [-0.2, 2.4, -0.2], fov: 38 },
};

const CAMERA_PRESET_BUTTONS: { id: CameraPresetId; label: string; icon: typeof Eye }[] = [
  { id: 'wide',    label: 'Wide View',      icon: Eye },
  { id: 'wall',    label: 'Wall Focus',     icon: Camera },
  { id: 'detail',  label: 'Detail View',    icon: Search },
  { id: 'closeup', label: 'Tile Close-Up',  icon: Focus },
];

/* ─────────── Camera Controller (inside Canvas) ───────── */

function CameraController({
  preset,
  controlsRef,
}: {
  preset: CameraPresetId;
  controlsRef: React.RefObject<React.ComponentRef<typeof OrbitControls> | null>;
}) {
  const { camera } = useThree();
  const isFirstRender = useRef(true);
  const perspCamera = camera as import('three').PerspectiveCamera;

  useEffect(() => {
    const p = CAMERA_PRESETS[preset];
    const controls = controlsRef.current;

    if (isFirstRender.current) {
      camera.position.set(...p.position);
      perspCamera.fov = p.fov;
      perspCamera.updateProjectionMatrix();
      if (controls) {
        controls.target.set(...p.target);
        controls.update();
      }
      isFirstRender.current = false;
      return;
    }

    // Smooth animate position
    gsap.to(camera.position, {
      x: p.position[0],
      y: p.position[1],
      z: p.position[2],
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: () => controls?.update(),
    });

    // Smooth animate FOV
    gsap.to(perspCamera, {
      fov: p.fov,
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: () => perspCamera.updateProjectionMatrix(),
    });

    // Smooth animate orbit target
    if (controls) {
      gsap.to(controls.target, {
        x: p.target[0],
        y: p.target[1],
        z: p.target[2],
        duration: 1.2,
        ease: 'power2.inOut',
        onUpdate: () => controls.update(),
      });
    }
  }, [preset, camera, perspCamera, controlsRef]);

  return null;
}

/* ──────────────── Scene Viewer (Canvas) ───────────────────── */

function SceneViewer(props: ModelRoomProps) {
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls> | null>(null);

  return (
    <Canvas
      key={props.config.id}
      shadows
      camera={{ fov: 55, near: 0.05 }}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      dpr={[1, 2]}
    >
      <color attach="background" args={[props.config.background]} />

      {/* Ambient base fill */}
      <ambientLight intensity={0.5} color={props.config.lightColor} />

      {/* Sky + ground hemisphere for natural color bleed */}
      <hemisphereLight
        intensity={0.42}
        color={props.config.lightColor}
        groundColor="#8a7e6e"
      />

      {/* Key light — main directional with crisp shadows */}
      <directionalLight
        castShadow
        intensity={1.5}
        position={[6, 9, 5]}
        color={props.config.lightColor}
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-bias={-0.00004}
        shadow-normalBias={0.02}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
      />

      {/* Fill light — softer, opposite side to reduce harsh shadows */}
      <directionalLight
        intensity={0.4}
        position={[-5, 6, -3]}
        color="#e8e4f0"
      />

      {/* Accent spot for specular highlights on ceramic */}
      <spotLight
        intensity={0.5}
        angle={0.45}
        penumbra={1}
        position={[-4.5, 7.5, 5.5]}
        color={props.config.lightColor}
        castShadow={false}
      />

      {/* Rim / back light for depth separation */}
      <pointLight
        intensity={0.25}
        position={[0, 5, -6]}
        color="#c8d4e8"
        decay={2}
        distance={18}
      />

      <Suspense fallback={null}>
        {/* HDR environment map for realistic reflections */}
        <Environment preset="apartment" environmentIntensity={0.35} />

        <SceneModel
          config={props.config}
          textureUrl={props.textureUrl}
          coverage={props.coverage}
          tileWidthM={props.tileWidthM}
          tileHeightM={props.tileHeightM}
          rotated={props.rotated}
          cameraPreset={props.cameraPreset}
        />
      </Suspense>

      {/* Infinite ground plane to eliminate the floating-model void */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={props.config.background} roughness={1} metalness={0} />
      </mesh>

      <ContactShadows
        position={[0, -0.01, 0]}
        scale={18}
        blur={2.0}
        opacity={0.3}
        far={10}
        color="#3a3228"
      />

      {/* Fog hides distant model edges */}
      <fog attach="fog" args={[props.config.background, 10, 22]} />

      <CameraController preset={props.cameraPreset} controlsRef={controlsRef} />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        minDistance={1.0}
        maxDistance={7}
        minPolarAngle={0.4}
        maxPolarAngle={Math.PI / 2.05}
        enablePan={false}
        maxAzimuthAngle={Math.PI / 2.5}
        minAzimuthAngle={-Math.PI / 2.5}
      />
    </Canvas>
  );
}

/* ──────────────── Scene Card ──────────────────────────────── */

function ReferenceSceneCard({
  scene,
  isActive,
  onSelect,
}: {
  scene: SceneConfig;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'overflow-hidden rounded-[24px] border text-left transition-all',
        isActive
          ? 'border-slate-900 bg-slate-900 text-white shadow-[0_24px_50px_rgba(15,23,42,0.18)]'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)]',
      )}
    >
      <div className="p-4 pb-0">
        <div className="overflow-hidden rounded-[18px] border border-slate-200/70">
          <img src={scene.image} alt={scene.name} className="h-28 w-full object-cover" />
        </div>
      </div>
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]',
              isActive ? 'bg-white/10 text-white/80' : 'bg-slate-50 text-slate-500',
            )}
          >
            {scene.eyebrow}
          </span>
          {isActive ? <Check className="h-4 w-4" /> : null}
        </div>
        <h5 className={cn('text-base font-bold', isActive ? 'text-white' : 'text-slate-900')}>
          {scene.name}
        </h5>
        <p className={cn('mt-1 text-sm leading-relaxed', isActive ? 'text-white/72' : 'text-slate-500')}>
          {scene.description}
        </p>
      </div>
    </button>
  );
}

/* ──────────────── Main Component ──────────────────────────── */

export default function VirtualRoomStudio({ product }: { product: CatalogProduct }) {
  const initialScene = ROOM_SCENES[3];
  const initialCoverage = getSuggestedCoverage(product.size, initialScene);
  const textureUrl = resolveProductImage(product.image);
  const brandLabel = product.brand?.trim() || (product.category === 'porcellanato' ? 'PREMIERE' : 'IKAD');
  const categoryLabel = product.category === 'porcellanato' ? 'Porcellanato' : 'Ceramic';
  const priceLabel = formatPrice(product.price);

  const [activeSceneId, setActiveSceneId] = useState(initialScene.id);
  const activeScene = useMemo(
    () => ROOM_SCENES.find((scene) => scene.id === activeSceneId) ?? initialScene,
    [activeSceneId],
  );

  const defaultCoverage = useMemo(
    () => getSuggestedCoverage(product.size, activeScene),
    [activeScene, product.size],
  );

  const [coverage, setCoverage] = useState<CoverageMode>(initialCoverage);
  const [rotated, setRotated] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPresetId>('wide');

  /* Auto-calculated tile dimensions in meters */
  const tileDimensions = useMemo(() => {
    const { widthCm, heightCm } = parseTileSize(product.size);
    const wM = widthCm / 100;
    const hM = heightCm / 100;
    return { widthM: wM, heightM: hM };
  }, [product.size]);

  /* When rotated 90°, swap width and height */
  const tileWidthM = rotated ? tileDimensions.heightM : tileDimensions.widthM;
  const tileHeightM = rotated ? tileDimensions.widthM : tileDimensions.heightM;

  const placementLabel =
    coverage === 'both'
      ? 'Floor + Wall'
      : coverage === 'wall'
        ? 'Wall Focus'
        : 'Floor Focus';

  const handleSelectScene = (scene: SceneConfig) => {
    const nextCoverage = getSuggestedCoverage(product.size, scene);
    setActiveSceneId(scene.id);
    setCoverage(nextCoverage);
  };

  const handleReset = () => {
    setCoverage(defaultCoverage);
    setRotated(false);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_360px]">
      <div className="space-y-5">
        {/* ── 3D Viewer Card ── */}
        <div className="rounded-[30px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_26%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                <Sparkles className="h-3.5 w-3.5" />
                6 Real 3D Rooms
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{activeScene.name}</h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">{activeScene.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-0 bg-slate-900 px-3 py-1.5 text-white">{placementLabel}</Badge>
              <Badge className="border-0 bg-amber-50 px-3 py-1.5 text-amber-700">GLTF scene</Badge>
              <Badge className="border-0 bg-white px-3 py-1.5 text-slate-500 shadow-sm">
                {ROOM_SCENES.findIndex((scene) => scene.id === activeScene.id) + 1} / {ROOM_SCENES.length} room
              </Badge>
            </div>
          </div>

          {/* Camera preset buttons */}
          <div className="mb-3 flex items-center gap-2">
            {CAMERA_PRESET_BUTTONS.map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setCameraPreset(btn.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all',
                    cameraPreset === btn.id
                      ? 'border-slate-900 bg-slate-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.16)]'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {btn.label}
                </button>
              );
            })}
          </div>

          <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] border border-white/70 bg-slate-100 shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
            <ThreePreviewBoundary key={`${textureUrl}-${activeScene.id}`}>
              <SceneViewer
                config={activeScene}
                textureUrl={textureUrl}
                coverage={coverage}
                tileWidthM={tileWidthM}
                tileHeightM={tileHeightM}
                rotated={rotated}
                cameraPreset={cameraPreset}
              />
            </ThreePreviewBoundary>

            <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-slate-950/74 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur">
              {activeScene.eyebrow}
            </div>

            <div className="pointer-events-none absolute inset-x-4 bottom-4 flex flex-wrap items-center gap-2 rounded-[20px] bg-white/92 px-3 py-2 shadow-[0_16px_32px_rgba(15,23,42,0.12)] backdrop-blur">
              <span className="text-xs font-semibold text-slate-900">{product.name}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-xs text-slate-500">{product.size} cm</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-xs text-slate-500">{brandLabel}</span>
            </div>
          </div>
        </div>

        {/* ── Scene Library ── */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Scene 3D Library</p>
              <h4 className="mt-1 text-lg font-bold text-slate-900">
                Pilih 1 dari 6 virtual room yang paling dekat dengan proyek user
              </h4>
              <p className="mt-1 text-sm text-slate-500">
                Semua preset ini memakai aset 3D asli, jadi preview tile terasa lebih proper untuk sales dan presentasi.
              </p>
            </div>
            <div className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 sm:block">
              6 scene 3D
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {ROOM_SCENES.map((scene) => (
              <ReferenceSceneCard
                key={scene.id}
                scene={scene}
                isActive={scene.id === activeScene.id}
                onSelect={() => handleSelectScene(scene)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <aside className="space-y-4">
        {/* Product info */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-start gap-4">
            <div className="h-24 w-24 overflow-hidden rounded-[22px] border border-slate-200 bg-slate-100 shadow-inner">
              <img src={textureUrl} alt={product.name} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-0 bg-slate-900 text-white">{brandLabel}</Badge>
                <Badge className="border-0 bg-slate-100 text-slate-600">{categoryLabel}</Badge>
              </div>
              <div>
                <h4 className="line-clamp-2 text-lg font-bold text-slate-900">{product.name}</h4>
                <p className="mt-1 text-sm text-slate-500">{priceLabel}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {[
              { label: 'Brand', value: brandLabel },
              { label: 'Ukuran', value: `${product.size} cm` },
              { label: 'Material', value: product.category === 'porcellanato' ? 'Porcellanato premium' : 'Ceramic premium' },
              { label: 'Scene aktif', value: activeScene.name },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <span className="text-sm text-slate-400">{item.label}</span>
                <span className="text-sm font-semibold text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Kontrol Visual (simplified) ── */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-amber-600" />
            <h4 className="text-lg font-bold text-slate-900">Kontrol Visual</h4>
          </div>

          <div className="space-y-5">
            {/* Material placement */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">Material placement</span>
                <span className="text-xs text-slate-400">Rekomendasi: {defaultCoverage}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'floor', label: 'Floor' },
                  { id: 'wall', label: 'Wall' },
                  { id: 'both', label: 'Both' },
                ] as const).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setCoverage(option.id)}
                    className={cn(
                      'rounded-2xl border px-3 py-3 text-sm font-semibold transition-all',
                      coverage === option.id
                        ? 'border-slate-900 bg-slate-900 text-white shadow-[0_12px_28px_rgba(15,23,42,0.16)]'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rotate 90° toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">Rotasi tile</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  {rotated ? '90°' : '0°'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRotated((prev) => !prev)}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all',
                  rotated
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white',
                )}
              >
                <RotateCw className="h-4 w-4" />
                {rotated ? 'Kembalikan 0°' : 'Putar 90°'}
              </button>
            </div>

            {/* Tile info card */}
            <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Ukuran tile aktif</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {rotated
                  ? `${parseTileSize(product.size).heightCm} × ${parseTileSize(product.size).widthCm} cm`
                  : `${parseTileSize(product.size).widthCm} × ${parseTileSize(product.size).heightCm} cm`}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Ukuran tile dihitung otomatis agar proporsional di setiap permukaan ruangan.
              </p>
            </div>

            {/* Reset button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="w-full rounded-2xl border-slate-200 py-6 text-sm font-semibold text-slate-700"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset preview
            </Button>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#111827_0%,#0f172a_100%)] p-5 text-white shadow-[0_22px_60px_rgba(15,23,42,0.24)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">Consultation Ready</p>
          <h4 className="mt-2 text-lg font-bold">Mau dibikinkan simulasi proyek asli?</h4>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Pilih scene yang paling mendekati kebutuhan customer, lalu lanjutkan konsultasi ke tim sales untuk penyesuaian proyek nyata.
          </p>
          <Button
            asChild
            className="mt-5 h-12 w-full rounded-2xl bg-amber-500 text-sm font-semibold text-slate-950 hover:bg-amber-400"
          >
            <a href={buildWhatsAppLink(product, activeScene)} target="_blank" rel="noreferrer">
              Konsultasi Produk Ini
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </aside>
    </div>
  );
}

ROOM_SCENES.forEach((scene) => {
  useGLTF.preload(scene.model);
});
