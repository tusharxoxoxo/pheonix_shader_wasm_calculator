defmodule ShaderApiWeb.Router do
  use Phoenix.Router

  pipeline :api do
    plug :accepts, ["json"]
    plug CORSPlug, origin: ["http://localhost:5174"]
  end

  scope "/api", ShaderApiWeb do
    pipe_through :api

    post "/generate-shader", ShaderController, :generate
  end

  # Enable LiveDashboard in development
  if Mix.env() == :dev do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through [:fetch_session, :protect_from_forgery]
      live_dashboard "/dashboard", metrics: ShaderApiWeb.Telemetry
    end
  end
end