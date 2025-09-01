defmodule CredApprove.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      CredApproveWeb.Telemetry,
      {DNSCluster, query: Application.get_env(:cred_approve, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: CredApprove.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: CredApprove.Finch},
      # Start ChromicPDF for PDF generation
      ChromicPDF,
      # Start to serve requests, typically the last entry
      CredApproveWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: CredApprove.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    CredApproveWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
