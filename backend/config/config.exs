import Config

config :shader_api, ShaderApiWeb.Endpoint,
  url: [host: "localhost"],
  render_errors: [
    formats: [json: ShaderApiWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: ShaderApi.PubSub,
  live_view: [signing_salt: "your_signing_salt"]

config :phoenix, :json_library, Jason

import_config "#{config_env()}.exs"