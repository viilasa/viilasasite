"use client";

import React, { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Color } from "ogl";

// Define the props interface, including new ones for optimization control
interface ThreadsProps {
  color?: [number, number, number];
  amplitude?: number;
  distance?: number;
  enableMouseInteraction?: boolean;
  // New Props for Optimization
  /** Controls shader complexity/line count adjustments, especially on mobile. Default 'high'. */
  quality?: 'high' | 'medium' | 'low';
  /** Overrides the default target FPS (Desktop: 60). */
  targetFPS?: number;
  /** Overrides the default target FPS specifically for mobile (Mobile: 40). */
  mobileTargetFPS?: number;
}

// Vertex Shader (unchanged)
const vertexShader = `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Updated Fragment Shader with mobile optimizations
const fragmentShader = `
  precision highp float; // Keep highp for now, test mediump if needed

  uniform float iTime;
  uniform vec3 iResolution;
  uniform vec3 uColor;
  uniform float uAmplitude;
  uniform float uDistance;
  uniform vec2 uMouse;
  uniform float uIsMobile; // New uniform: 1.0 for mobile, 0.0 otherwise

  #define PI 3.1415926538

  const int u_line_count_max = 40; // Max lines (original count)
  const float u_line_width = 7.0;
  const float u_line_blur = 10.0;

  float pixel(float count, vec2 resolution) {
      return 1.0 / max(resolution.x, resolution.y) * count;
  }

  // Perlin Noise function (unchanged)
  float Perlin2D(vec2 P)
  {
      // ... (Perlin noise code remains the same) ...
      vec2 Pi = floor(P);
      vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
      vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
      Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
      Pt += vec2(26.0, 161.0).xyxy;
      Pt *= Pt;
      Pt = Pt.xzxz * Pt.yyww;
      vec4 hash_x = fract(Pt * (1.0 / 951.135664));
      vec4 hash_y = fract(Pt * (1.0 / 642.949883));
      vec4 grad_x = hash_x - 0.49999;
      vec4 grad_y = hash_y - 0.49999;
      vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y) * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
      grad_results *= 1.4142135623730950488016887242097;
      vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
      vec4 blend2 = vec4(blend, vec2(1.0 - blend));
      return dot(grad_results, blend2.zxzx * blend2.wwyy);
  }

  // Line drawing function with mobile optimizations
  float line(vec2 st, float width, float perc, float offset, float mobile_amplitude_factor) {
      float split_offset = (perc * 0.4);
      float split_point = 0.1 + split_offset;

      float amplitude_normal = smoothstep(split_point, 0.7, st.x);
      // Apply mobile factor here if needed, or adjust base amplitude
      float amplitude_strength = 0.5 * mobile_amplitude_factor;
      float amplitude = amplitude_normal * amplitude_strength * uAmplitude * (1.0 + (uMouse.y - 0.5) * 0.2);

      float time_scaled = iTime / 10.0 + (uMouse.x - 0.5) * 1.0;

      float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;

      float xnoise;
      // --- Mobile Optimization ---
      if (uIsMobile > 0.5) {
           // Simpler noise calculation for mobile
           xnoise = Perlin2D(vec2(time_scaled, st.x + perc) * 2.0); // Reduced frequency/complexity
           amplitude *= 0.8; // Optionally reduce amplitude further on mobile
      } else {
           // Original noise calculation for desktop
           xnoise = mix(
               Perlin2D(vec2(time_scaled, st.x + perc) * 2.5),
               Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
               st.x * 0.3
           );
      }
      // --- End Mobile Optimization ---

      float y = 0.5 + (perc - 0.5) * uDistance + xnoise / 2.0 * amplitude;

      float line_start = smoothstep(
          y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
          y,
          st.y
      );

      float line_end = smoothstep(
          y,
          y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
          st.y
      );

      return clamp(
          (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
          0.0,
          1.0
      );
  }

  void mainImage( out vec4 fragColor, in vec2 fragCoord )
  {
      vec2 uv = fragCoord / iResolution.xy;

      float line_strength = 1.0;
      float line_count = float(u_line_count_max); // Start with max
      float mobile_factor = 1.0; // Factor for adjustments
      float mobile_amplitude_factor = 1.0; // Factor for amplitude adjustments

      // Adjust line count and potentially other factors based on resolution and uIsMobile
      if (uIsMobile > 0.5) {
          // Base mobile adjustments (more aggressive reduction)
          mobile_factor = 0.6;
          mobile_amplitude_factor = 0.8; // Slightly less amplitude on mobile base

          if (iResolution.x < 768.0) { // Medium mobile screen
              mobile_factor = 0.5; // Further reduce lines
          }
          if (iResolution.x < 480.0) { // Small mobile screen
              mobile_factor = 0.4; // Reduce lines significantly
              mobile_amplitude_factor = 0.7; // Reduce amplitude more
          }
           line_count = float(u_line_count_max) * mobile_factor;
      } else {
           // Optional non-mobile adjustments (could be removed if not needed)
           if (iResolution.x < 768.0) {
               // Less aggressive reduction for small non-mobile windows
               // mobile_factor = 0.8;
               // line_count = float(u_line_count_max) * mobile_factor;
           }
      }


      // Adjust line width scaling based on screen size (more pronounced on smaller screens)
      float scale = 1.0;
      if (iResolution.x < 768.0) scale = 1.5;
      if (iResolution.x < 480.0) scale = 2.0;


      // Loop up to the original max count, but break early based on calculated line_count
      for (int i = 0; i < u_line_count_max; i++) {
          if (float(i) >= line_count) break; // Exit loop early if fewer lines are needed

          // Calculate percentage based on the original max count for smoother distribution/appearance
          float perc = float(i) / float(u_line_count_max - 1); // Normalize 0 to 1 based on max count

          // Pass mobile amplitude factor to line function
          line_strength *= (1.0 - line(
              uv,
              // Adjust width based on scale and make lines thinner towards the edges
              u_line_width * pixel(1.0, iResolution.xy) * scale * (1.0 - perc),
              perc,
              (PI * 1.0) * perc, // Offset based on percentage
              mobile_amplitude_factor
          ));
      }

      float color_intensity = 1.0 - line_strength;
      fragColor = vec4(uColor * color_intensity, color_intensity);
  }

  void main() {
      mainImage(gl_FragColor, gl_FragCoord.xy);
  }
`;

// Updated React Component
const Threads: React.FC<ThreadsProps> = ({
  color = [1, 1, 1],
  amplitude = 1,
  distance = 0,
  enableMouseInteraction = false,
  quality = 'high', // Default quality
  targetFPS: propsTargetFPS, // Renamed to avoid conflict
  mobileTargetFPS,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>();
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const rendererRef = useRef<Renderer | null>(null); // Ref to store renderer instance
  const programRef = useRef<Program | null>(null); // Ref to store program instance
  const isMobileRef = useRef<boolean>(false); // Ref to store mobile status

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // --- Mobile Detection (Simple Example) ---
    // For more robust detection, consider libraries like 'react-device-detect'
    // or checking navigator.userAgentData.mobile if available
    const checkMobile = () => window.innerWidth < 768;
    isMobileRef.current = checkMobile();
    // --- End Mobile Detection ---

    // --- Target FPS Calculation ---
    let actualTargetFPS = propsTargetFPS ?? 60; // Use prop or default desktop FPS
    if (isMobileRef.current) {
        // Use mobile prop if provided, otherwise use default mobile FPS
        actualTargetFPS = mobileTargetFPS ?? 40;
    }
    // Apply quality setting adjustments (example: lower FPS for lower quality)
    if (quality === 'medium') {
        actualTargetFPS = Math.max(30, actualTargetFPS * 0.85);
    } else if (quality === 'low') {
        actualTargetFPS = Math.max(25, actualTargetFPS * 0.65);
    }
    const frameInterval = 1000 / actualTargetFPS;
    // --- End Target FPS Calculation ---


    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, quality === 'low' ? 1 : 1.5), // Lower DPR on low quality
      alpha: true,
      antialias: false // Keep AA off for performance
    });
    rendererRef.current = renderer; // Store renderer instance

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);

    // Pass uIsMobile uniform based on detection
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Color(
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height
          ),
        },
        uColor: { value: new Color(...color) },
        uAmplitude: { value: amplitude },
        uDistance: { value: distance },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uIsMobile: { value: isMobileRef.current ? 1.0 : 0.0 }, // Set initial mobile state
      },
    });
    programRef.current = program; // Store program instance

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
        if (!container || !rendererRef.current || !programRef.current) return;
        const { clientWidth, clientHeight } = container;

        // Re-check mobile status on resize
        isMobileRef.current = checkMobile();
        programRef.current.uniforms.uIsMobile.value = isMobileRef.current ? 1.0 : 0.0;

        // Update renderer and resolution uniform
        rendererRef.current.setSize(clientWidth, clientHeight);
        programRef.current.uniforms.iResolution.value.set(
            clientWidth,
            clientHeight,
            clientWidth / clientHeight
        );
    }

    // Use ResizeObserver for efficient resize handling
    resizeObserver.current = new ResizeObserver(resize);
    resizeObserver.current.observe(container);

    let currentMouse = [0.5, 0.5];
    let targetMouse = [0.5, 0.5];
    let isInView = true;

    // Intersection Observer for performance optimization
    const observer = new IntersectionObserver(
      (entries) => {
        isInView = entries[0].isIntersecting;
      },
      { threshold: 0.1 } // Render if at least 10% is visible
    );
    observer.observe(container);

    function handleMouseMove(e: TouchEvent | MouseEvent) {
        if (!isInView || !container) return; // Check if container exists

        const rect = container.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
        // Clamp values to prevent issues if mouse goes slightly outside bounds
        targetMouse = [
            Math.max(0, Math.min(1, x / rect.width)),
            Math.max(0, Math.min(1, 1.0 - y / rect.height))
        ];
    }

    function handleMouseLeave() {
      targetMouse = [0.5, 0.5]; // Reset to center
    }

    if (enableMouseInteraction) {
      container.addEventListener('mousemove', handleMouseMove, { passive: true });
      container.addEventListener('touchmove', handleMouseMove, { passive: true });
      container.addEventListener('mouseleave', handleMouseLeave);
      container.addEventListener('touchend', handleMouseLeave);
    }

    let lastTime = 0;

    function update(timestamp: number) {
        // Ensure refs are current before proceeding
        if (!rendererRef.current || !programRef.current) {
             animationFrameId.current = requestAnimationFrame(update);
             return;
        }

        if (!isInView) { // Skip rendering if not in view
          animationFrameId.current = requestAnimationFrame(update);
          return;
        }

        const deltaTime = timestamp - lastTime;

        // Frame throttling logic
        if (deltaTime < frameInterval) {
          animationFrameId.current = requestAnimationFrame(update);
          return;
        }
        // Adjust lastTime to account for frame drops/skips
        lastTime = timestamp - (deltaTime % frameInterval);

        // Apply mouse smoothing only if interaction is enabled
        if (enableMouseInteraction) {
            const smoothing = 0.05; // Adjust smoothing factor if needed
            currentMouse[0] += smoothing * (targetMouse[0] - currentMouse[0]);
            currentMouse[1] += smoothing * (targetMouse[1] - currentMouse[1]);
            programRef.current.uniforms.uMouse.value[0] = currentMouse[0];
            programRef.current.uniforms.uMouse.value[1] = currentMouse[1];
        }

        // Update time uniform
        programRef.current.uniforms.iTime.value = timestamp * 0.001;

        // Render the scene
        rendererRef.current.render({ scene: mesh });

        // Request next frame
        animationFrameId.current = requestAnimationFrame(update);
    }

    // Initial resize and start animation loop
    resize();
    animationFrameId.current = requestAnimationFrame(update);

    // --- Cleanup Function ---
    return () => {
        // Cancel animation frame
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        // Disconnect observers
        if (resizeObserver.current) {
            resizeObserver.current.disconnect();
        }
        observer.disconnect();

        // Remove event listeners
        if (enableMouseInteraction && container) { // Check container exists
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('touchmove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            container.removeEventListener('touchend', handleMouseLeave);
        }

        // Clean up WebGL resources
        if (rendererRef.current && container) { // Check renderer and container
            const gl = rendererRef.current.gl;
            // Attempt to lose context gracefully
            gl.getExtension('WEBGL_lose_context')?.loseContext();

             // Remove canvas only if it's still a child
             if (container.contains(gl.canvas)) {
                 container.removeChild(gl.canvas);
             }
        }

        // Clear refs
        rendererRef.current = null;
        programRef.current = null;
    };
    // Update dependencies: include props that affect setup or initial calculations
  }, [color, amplitude, distance, enableMouseInteraction, quality, propsTargetFPS, mobileTargetFPS]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative touch-none select-none" // Added touch-none and select-none for better interaction on mobile
      style={{ WebkitTapHighlightColor: 'transparent' }} // Remove tap highlight on iOS
      {...rest}
    />
  );
};

export default Threads;