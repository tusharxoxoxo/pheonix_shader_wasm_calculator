import Config

config :shader_api, ShaderApiWeb.Endpoint,
  url: [host: System.get_env("HOST") || "localhost", port: System.get_env("PORT") || 4000],
  http: [port: String.to_integer(System.get_env("PORT") || "4000")],
  secret_key_base: System.get_env("SECRET_KEY_BASE") || "your_prod_secret_key_base_at_least_64_bytes_long_please_change",
  server: true,
  check_origin: false

config :logger, level: :info