import { useState, useRef } from 'react';

interface ShaderResponse {
  vertexShader?: string;
  fragmentShader?: string;
  error?: string;
}

export default function TextToShader() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setShaderCode] = useState<ShaderResponse | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateShader = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/generate-shader', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('Failed to generate shader');
      }

      const data = await response.json();
      const shaderResponse = parseShaderResponse(data);
      setShaderCode(shaderResponse);

      if (!shaderResponse.error) {
        initWebGL(shaderResponse);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const parseShaderResponse = (data: any): ShaderResponse => {
    try {
      if (data.status === 'success' && data.shader_code) {
        return {
          vertexShader: `
            attribute vec4 a_position;
            void main() {
              gl_Position = a_position;
            }
          `,
          fragmentShader: data.shader_code.replace(/```glsl\n|```\n?/g, '').trim()
        };
      }
      throw new Error(data.message || 'Invalid response format');
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Failed to parse shader response'
      };
    }
  };

  const initWebGL = (shaderResponse: ShaderResponse) => {
    if (!canvasRef.current || !shaderResponse.vertexShader || !shaderResponse.fragmentShader) {
      return;
    }

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');

    if (!gl) {
      setError('WebGL not supported');
      return;
    }

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, shaderResponse.vertexShader);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, shaderResponse.fragmentShader);

    if (!vertexShader || !fragmentShader) {
      setError('Failed to create shaders');
      return;
    }

    // Create program
    const program = gl.createProgram();
    if (!program) {
      setError('Failed to create shader program');
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setError('Failed to link shader program');
      return;
    }

    gl.useProgram(program);

    // Set up position buffer
    const positions = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      setError(`Shader compilation error: ${gl.getShaderInfoLog(shader)}`);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  return (
    <div className="text-to-shader">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your shader..."
        rows={4}
        className="w-full p-2 border rounded"
      />
      <button
        onClick={generateShader}
        disabled={isLoading}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isLoading ? 'Generating...' : 'Generate Shader'}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="mt-4 border"
      />
    </div>
  );
}