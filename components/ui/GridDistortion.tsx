import React, { useRef, useEffect } from "react";
import * as THREE from "three";

interface GridDistortionProps {
  grid?: number;
  mouse?: number;
  strength?: number;
  relaxation?: number;
  imageSrc: string;
  className?: string;
}

// Vertex Shader (defines how vertices are positioned)
const vertexShader = `
uniform float time;
varying vec2 vUv; // Pass UV coordinates to fragment shader
varying vec3 vPosition; // Pass vertex position to fragment shader

void main() {
  vUv = uv; // UV coordinates from geometry attributes
  vPosition = position; // Vertex position from geometry attributes
  // Standard transformation to screen coordinates
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment Shader (defines the color of each pixel/fragment)
const fragmentShader = `
uniform sampler2D uDataTexture; // Texture holding distortion data (offset vectors)
uniform sampler2D uTexture;     // The image texture to display
uniform vec4 resolution;        // Screen resolution (unused here but often useful)
varying vec2 vUv;              // Interpolated UV coordinates from vertex shader

void main() {
  vec2 uv = vUv;
  // Sample the data texture at the current UV coordinate
  // 'offset.rg' contains the distortion vector (red = x-offset, green = y-offset)
  vec4 offset = texture2D(uDataTexture, vUv);
  // Sample the main image texture, but displace the lookup coordinate (uv)
  // by the offset vector (scaled by 0.02, adjust as needed)
  gl_FragColor = texture2D(uTexture, uv - 0.02 * offset.rg);
}
`;

const GridDistortion: React.FC<GridDistortionProps> = ({
  grid = 15,        // Size of the distortion grid
  mouse = 0.1,      // Radius of mouse influence (as fraction of grid size)
  strength = 0.15,  // How strongly the mouse velocity affects distortion
  relaxation = 0.9, // How quickly the distortion fades (0.9 = slow fade, closer to 0 = fast fade)
  imageSrc,         // URL of the image to display
  className = "",   // Optional additional CSS classes for the container
}) => {
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the container div
  const imageAspectRef = useRef<number>(1); // Ref to store the image aspect ratio
  // Refs to keep track of Three.js objects for cleanup/access
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const planeRef = useRef<THREE.Mesh | null>(null);
  const geometryRef = useRef<THREE.PlaneGeometry | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const dataTextureRef = useRef<THREE.DataTexture | null>(null);
  const imageTextureRef = useRef<THREE.Texture | null>(null);
  const animationFrameId = useRef<number | null>(null); // Store requestAnimationFrame ID

  useEffect(() => {
    if (!containerRef.current) return; // Exit if container div isn't mounted yet

    const container = containerRef.current;

    // --- Three.js Setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({
      antialias: true, // Smoother edges
      alpha: true,     // Transparent background
      powerPreference: "high-performance", // Request GPU if available
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Adjust for screen resolution
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement); // Add canvas to the container div

    // Orthographic camera (no perspective) needed for 2D plane effects
    const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -1000, 1000);
    camera.position.z = 2; // Position camera to look at the scene
    cameraRef.current = camera;

    // Uniforms: Variables passed from JS to the shaders
    const uniforms = {
      time: { value: 0 }, // Time uniform for potential animations
      resolution: { value: new THREE.Vector4() }, // Container dimensions
      uTexture: { value: null as THREE.Texture | null }, // Image texture
      uDataTexture: { value: null as THREE.DataTexture | null }, // Distortion data texture
    };

    // --- Texture Loading ---
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imageSrc, (texture) => {
      imageTextureRef.current = texture; // Store for cleanup
      texture.minFilter = THREE.LinearFilter; // Smoothing for texture scaling
      imageAspectRef.current = texture.image.width / texture.image.height; // Calculate aspect ratio
      uniforms.uTexture.value = texture; // Assign texture to uniform
      handleResize(); // Resize now that we have the aspect ratio
    },
     undefined, // onProgress callback (optional)
     (error) => { console.error('Error loading texture:', imageSrc, error); } // onError callback
    );


    // --- Data Texture Setup (for distortion) ---
    const dataSize = grid; // Use the grid prop for data texture dimensions
    const data = new Float32Array(4 * dataSize * dataSize); // RGBA float data
    const dataTexture = new THREE.DataTexture(
      data,          // The Float32Array data
      dataSize,      // Width
      dataSize,      // Height
      THREE.RGBAFormat, // Format
      THREE.FloatType   // Data type
    );
    dataTexture.needsUpdate = true; // Tell Three.js to upload the data to the GPU
    dataTextureRef.current = dataTexture; // Store for cleanup
    uniforms.uDataTexture.value = dataTexture; // Assign data texture to uniform

    // --- Material and Geometry ---
    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide, // Render both sides of the plane
      uniforms: uniforms,     // Pass uniforms to the shaders
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true, // Needed if alpha: true in renderer and using transparency
    });
    materialRef.current = material;

    // Plane geometry with segments matching the data grid size for smoother distortion
    // Use a 1x1 plane, scaling will handle the aspect ratio
    const geometry = new THREE.PlaneGeometry(1, 1, dataSize - 1, dataSize - 1);
    geometryRef.current = geometry;

    // Create the mesh (geometry + material) and add it to the scene
    const plane = new THREE.Mesh(geometry, material);
    planeRef.current = plane;
    scene.add(plane);

    // --- Resize Handling ---
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current || !planeRef.current || !imageAspectRef.current) return;

      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;
      if(width === 0 || height === 0) return; // Avoid calculations if dimensions are zero

      const containerAspect = width / height;
      const imageAspect = imageAspectRef.current;

      // Update renderer size
      rendererRef.current.setSize(width, height);

      // --- CORRECTED Plane Scale Calculation for "cover" ---
      let scaleX, scaleY;

      if (imageAspect > containerAspect) {
          // Image is wider than container: Fit height, scale width proportionally
          scaleY = 1.0;
          scaleX = imageAspect / containerAspect;
      } else {
          // Image is taller than or same aspect as container: Fit width, scale height proportionally
          scaleX = 1.0;
          scaleY = containerAspect / imageAspect;
      }
      // The camera's view dimensions are based on containerAspect, so we need to scale the plane
      // relative to the camera's view to make it cover.
      // The plane's natural size in camera view is (planeAspect * cameraHeight, cameraHeight) or (cameraWidth, cameraWidth / planeAspect)
      // The camera view has dimensions (frustumWidth, frustumHeight) which are (containerAspect * 1, 1)
      // We want plane final scale to be max(containerAspect / imageAspect, 1) in height and max(imageAspect / containerAspect, 1) in width

      let finalScaleX = 1.0;
      let finalScaleY = 1.0;
      if (imageAspect > containerAspect) {
          // Image wider than view: Cover view vertically, extend horizontally
          finalScaleY = 1.0;
          finalScaleX = imageAspect / containerAspect;
      } else {
          // Image taller than view: Cover view horizontally, extend vertically
          finalScaleX = 1.0;
          finalScaleY = containerAspect / imageAspect;
      }

       planeRef.current.scale.set(finalScaleX * containerAspect, finalScaleY, 1); // Apply scale to the plane mesh
       // Multiply finalScaleX by containerAspect because the camera frustum width is containerAspect * height (where height is 1)

      // --- Update Camera Frustum ---
      // Keep frustum based on container aspect ratio
      const frustumHeight = 1; // Define camera view height = 1 unit
      const frustumWidth = frustumHeight * containerAspect;
      cameraRef.current.left = -frustumWidth / 2;
      cameraRef.current.right = frustumWidth / 2;
      cameraRef.current.top = frustumHeight / 2;
      cameraRef.current.bottom = -frustumHeight / 2;
      cameraRef.current.updateProjectionMatrix(); // Apply camera changes

      // Update resolution uniform (optional, if shaders need it)
      uniforms.resolution.value.set(width, height, containerAspect, 1/containerAspect);
    };


    // --- Mouse State ---
    const mouseState = {
      x: 0.5,       // Start at center X
      y: 0.5,       // Start at center Y
      prevX: 0.5,   // Previous normalized X
      prevY: 0.5,   // Previous normalized Y
      vX: 0,        // Velocity X
      vY: 0,        // Velocity Y
    };

    // --- CORRECTED Mouse Event Handlers ---
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const currentX = (e.clientX - rect.left) / rect.width;
      const currentY = 1 - (e.clientY - rect.top) / rect.height; // Inverted Y

      // Calculate velocity using CURRENT position and STORED PREVIOUS position
      const currentVX = currentX - mouseState.prevX;
      const currentVY = currentY - mouseState.prevY;

      // Update the state
      mouseState.x = currentX;
      mouseState.y = currentY;
      mouseState.vX = currentVX;
      mouseState.vY = currentVY;
      // Update previous position for the next event calculation
      mouseState.prevX = currentX;
      mouseState.prevY = currentY;
    };

    const handleMouseLeave = () => {
      // Reset position and velocity when mouse leaves
      Object.assign(mouseState, {
        // Reset to center
        x: 0.5,
        y: 0.5,
        prevX: 0.5,
        prevY: 0.5,
        vX: 0, // Definitely reset velocity
        vY: 0,
      });
    };

    // Add event listeners
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    // Initial resize call
    handleResize();

    // --- Animation Loop ---
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate); // Loop
      uniforms.time.value += 0.05; // Increment time uniform

      if (!dataTextureRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current ) return; // Ensure refs exist

      const data = dataTextureRef.current.image.data as unknown as Float32Array;

      // Apply relaxation (fade out previous distortion)
      for (let i = 0; i < dataSize * dataSize; i++) {
        data[i * 4] *= relaxation;     // Fade X offset (Red channel)
        data[i * 4 + 1] *= relaxation; // Fade Y offset (Green channel)
      }

      // Apply new distortion based on mouse velocity
      const gridMouseX = dataSize * mouseState.x; // Mouse X in grid coordinates
      const gridMouseY = dataSize * mouseState.y; // Mouse Y in grid coordinates
      const maxDist = dataSize * mouse;          // Max influence radius in grid coords

      for (let i = 0; i < dataSize; i++) { // Loop through grid columns (X)
        for (let j = 0; j < dataSize; j++) { // Loop through grid rows (Y)
          // Calculate squared distance from grid point (i, j) to mouse position
          const distSq = Math.pow(gridMouseX - i, 2) + Math.pow(gridMouseY - j, 2);
          const maxDistSq = maxDist * maxDist; // Cache squared max distance

          // Check if the grid point is within the mouse influence radius
          if (distSq < maxDistSq) {
            const index = 4 * (i + dataSize * j); // Calculate index in the 1D data array
            // Calculate influence power (stronger closer to the mouse center)
            const distance = Math.sqrt(distSq);
            const power = Math.min(maxDist / (distance + 0.0001), 10.0); // Clamped power

            // Apply distortion based on mouse velocity, strength, and power
            const effectStrength = strength * 100.0; // Scale strength
            data[index] += effectStrength * mouseState.vX * power; // Add X offset
            data[index + 1] += effectStrength * mouseState.vY * power; // Add Y offset (Corrected based on testing common patterns)
          }
        }
      }

      dataTextureRef.current.needsUpdate = true; // Tell Three.js the texture data changed
      rendererRef.current.render(sceneRef.current, cameraRef.current); // Render the scene
    };
    animate(); // Start the animation loop

    // --- Cleanup Function ---
    return () => {
      // Cancel animation loop
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      // Remove event listeners
      containerRef.current?.removeEventListener("mousemove", handleMouseMove);
      containerRef.current?.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);

      // Dispose of Three.js objects to free GPU memory
      geometryRef.current?.dispose();
      materialRef.current?.dispose();
      dataTextureRef.current?.dispose();
      imageTextureRef.current?.dispose(); // Dispose loaded image texture
      rendererRef.current?.dispose(); // Dispose renderer context

      // Remove the canvas from the DOM
      if (rendererRef.current?.domElement && containerRef.current?.contains(rendererRef.current.domElement)) {
           containerRef.current.removeChild(rendererRef.current.domElement);
      }

      // Clear refs (optional, helps GC)
      cameraRef.current = null;
      rendererRef.current = null;
      sceneRef.current = null;
      planeRef.current = null;
      geometryRef.current = null;
      materialRef.current = null;
      dataTextureRef.current = null;
      imageTextureRef.current = null;
    };
  }, [grid, mouse, strength, relaxation, imageSrc]); // Re-run effect if these props change

  // Render the container div that Three.js will attach its canvas to
  return (
    <div
      ref={containerRef}
      className={`w-full h-full overflow-hidden ${className}`} // Ensure it takes up space and hides canvas overflow
    />
  );
};

export default GridDistortion;
