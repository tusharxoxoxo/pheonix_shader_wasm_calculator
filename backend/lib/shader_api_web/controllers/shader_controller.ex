defmodule ShaderApiWeb.ShaderController do
  use Phoenix.Controller
  require Logger

  @gemini_api_key System.get_env("GEMINI_API_KEY")
  @gemini_api_url "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

  def generate(conn, %{"prompt" => prompt}) do
    case generate_shader_code(prompt) do
      {:ok, shader_code} ->
        json(conn, %{status: "success", shader_code: shader_code, type: "fragment"})
      {:error, reason} ->
        Logger.error("Shader generation failed: #{inspect(reason)}")
        conn
        |> put_status(:internal_server_error)
        |> json(%{status: "error", message: reason})
    end
  end

  defp generate_shader_code(description) do
    Logger.info("Starting shader generation with description: #{String.slice(description, 0, 100)}...")
    prompt = """
    Generate a GLSL fragment shader code based on this description: #{description}
    The shader should:
    1. Be compatible with WebGL
    2. Include necessary uniforms (time and resolution)
    3. Start with precision qualifiers for floats
    4. Be well-commented
    5. Only include the fragment shader code
    6. Use 'resolution' instead of 'u_resolution' for the resolution uniform
    7. Use 'time' instead of 'u_time' for the time uniform

    Important requirements:
    - MUST start with precision mediump float;
    - MUST include uniform float time;
    - MUST include uniform vec2 resolution;
    - MUST include void main() function
    - MUST set gl_FragColor
    - DO NOT include any markdown code blocks
    - DO NOT include any explanatory text
    - Return ONLY the shader code
    """

    Logger.debug("Constructed prompt for Gemini API")

    headers = [
      {"Content-Type", "application/json"},
      {"x-goog-api-key", @gemini_api_key}
    ]

    body = Jason.encode!(%{
      contents: [%{
        parts: [%{text: prompt}]
      }],
      generationConfig: %{
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    })

    Logger.debug("Request body prepared: #{inspect(body, pretty: true)}")

    if is_nil(@gemini_api_key) do
      Logger.error("GEMINI_API_KEY environment variable is not set")
      {:error, "API key not configured. Please check server configuration."}
    else
      Logger.info("Making request to Gemini API")
      case HTTPoison.post(@gemini_api_url, body, headers) do
        {:ok, %{status_code: 200, body: response_body}} ->
          Logger.info("Received successful response from Gemini API")
          Logger.debug("Raw response: #{inspect(response_body)}")
          case Jason.decode(response_body) do
            {:ok, %{"candidates" => [%{"content" => %{"parts" => [%{"text" => shader_code}]}}]}} ->
              Logger.info("Successfully parsed API response")
              cleaned_code = shader_code
                |> String.replace(~r/```glsl\n|```\n?/, "")
                |> String.trim()
              
              Logger.debug("Cleaned shader code: #{inspect(cleaned_code)}")
              
              if String.contains?(cleaned_code, "precision") and String.contains?(cleaned_code, "void main()") do
                Logger.info("Shader code validation passed")
                {:ok, cleaned_code}
              else
                Logger.error("Invalid shader code generated: #{inspect(cleaned_code)}")
                Logger.error("Missing required elements in generated code")
                {:error, "Generated shader code is invalid or incomplete"}
              end
            {:ok, response} ->
              Logger.error("Unexpected API response structure: #{inspect(response)}")
              {:error, "Unexpected API response format"}
            {:error, reason} ->
              Logger.error("Failed to parse API response: #{inspect(reason)}")
              {:error, "Failed to parse API response"}
          end
        {:ok, %{status_code: status_code, body: error_body}} ->
          Logger.error("Gemini API error: Status #{status_code}, Body: #{inspect(error_body)}")
          {:error, "API request failed with status #{status_code}"}
        {:error, %HTTPoison.Error{reason: reason}} ->
          Logger.error("HTTP request failed: #{inspect(reason)}")
          {:error, "Failed to communicate with API service"}
      end
    end
  end
end