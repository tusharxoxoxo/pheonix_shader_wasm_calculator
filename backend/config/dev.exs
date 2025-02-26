import Config

config :shader_api, ShaderApiWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4000],
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  secret_key_base: "your_dev_secret_key_base_at_least_64_bytes_long_please_change",
  watchers: []

config :phoenix, :stacktrace_depth, 20
config :phoenix, :plug_init_mode, :runtime