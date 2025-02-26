import Config

if config_env() == :prod do
  config :shader_api, ShaderApiWeb.Endpoint,
    url: [host: "localhost", port: 4000],
    http: [port: 4000],
    secret_key_base: System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.
      You can generate one by calling: mix phx.gen.secret
      """
end

config :shader_api,
  gemini_api_key: System.get_env("GEMINI_API_KEY")