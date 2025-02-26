import { useState, useEffect, useRef } from "react";

interface ShaderResponse {
  status: string;
  shader_code: string;
  type: string;
  message?: string;
}

interface WebGLContext {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  timeUniformLocation: WebGLUniformLocation | null;
  resolutionUniformLocation: WebGLUniformLocation | null;
}

export default function ShaderGenerator() {
  const [description, setDescription] = useState("");
  const [shaderCode, setShaderCode] = useState(`
    precision mediump float;
    uniform float time;
    uniform vec2 resolution;
    
    void main() {
      vec2 uv = gl_FragCoord.xy/resolution.xy;
      gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);
    }
  `);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const glContextRef = useRef<WebGLContext | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl");
    if (!gl) {
      setError("WebGL not supported");
      return;
    }

    // Initialize WebGL context
    const program = initWebGL(gl, shaderCode);
    if (!program) return;

    glContextRef.current = {
      gl,
      program,
      timeUniformLocation: gl.getUniformLocation(program, "time"),
      resolutionUniformLocation: gl.getUniformLocation(program, "resolution"),
    };

    // Start animation
    const startTime = performance.now();
    animate(startTime);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [shaderCode]);

  const animate = (time: number) => {
    const context = glContextRef.current;
    if (!context) return;

    const { gl, program, timeUniformLocation, resolutionUniformLocation } =
      context;

    gl.useProgram(program);

    if (timeUniformLocation) {
      gl.uniform1f(timeUniformLocation, time * 0.001);
    }

    if (resolutionUniformLocation) {
      gl.uniform2f(
        resolutionUniformLocation,
        gl.canvas.width,
        gl.canvas.height
      );
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:4000/api/generate-shader",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: description }),
        }
      );

      const data: ShaderResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate shader");
      }

      if (!data.shader_code || data.shader_code.trim() === "") {
        throw new Error("Received empty shader code from server");
      }

      setShaderCode(data.shader_code);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while generating the shader"
      );
      // Keep the current shader code on error
      setShaderCode(shaderCode);
    }
  };

  return (
    <div className="shader-generator">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Describe your shader:
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={4}
          />
        </div>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Generate Shader
        </button>
      </form>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-300"
      />
    </div>
  );
}

function initWebGL(
  gl: WebGLRenderingContext,
  shaderCode: string
): WebGLProgram | null {
  // Vertex shader source
  const vsSource = `
    attribute vec4 a_position;
    void main() {
      gl_Position = a_position;
    }
  `;

  // Create shaders
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, shaderCode);

  if (!vertexShader || !fragmentShader) return null;

  // Create program
  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(
      "Unable to initialize the shader program:",
      gl.getProgramInfoLog(program)
    );
    return null;
  }

  // Set up position buffer
  const positions = new Float32Array([
    -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
  ]);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  return program;
}

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  if (!source || source.trim() === "") {
    console.error("Shader source code is empty");
    return null;
  }

  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);
    console.error("An error occurred compiling the shaders:", error);

    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
