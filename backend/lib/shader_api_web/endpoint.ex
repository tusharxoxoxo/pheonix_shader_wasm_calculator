defmodule ShaderApiWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :shader_api

  # CORS configuration
  plug CORSPlug,
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    headers: ["Authorization", "Content-Type", "Accept", "Origin", "User-Agent"]

  # The session will be stored in the cookie and signed,
  # this means its contents can be read but not tampered with.
  @session_options [
    store: :cookie,
    key: "_shader_api_key",
    signing_salt: "YourSigningSalt"
  ]

  socket "/live", Phoenix.LiveView.Socket

  # Serve at "/" the static files from "priv/static" directory.
  plug Plug.Static,
    at: "/",
    from: :shader_api,
    gzip: false,
    only: ShaderApiWeb.static_paths()

  # Code reloading can be explicitly enabled under the
  # :code_reloader configuration of your endpoint.
  if code_reloading? do
    plug Phoenix.CodeReloader
  end

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options
  plug ShaderApiWeb.Router
end