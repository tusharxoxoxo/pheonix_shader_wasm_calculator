import Config

if config_env() == :prod do
  config :shader_api, ShaderApiWeb.Endpoint,
    url: [host: "localhost", port: 4000],
    http: [port: 4000],
    secret_key_base: ""
end

config :shader_api,
  gemini_api_key: System.get_env("GEMINI_API_KEY")
