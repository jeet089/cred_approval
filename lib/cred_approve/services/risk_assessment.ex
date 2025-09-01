defmodule CredApprove.Services.RiskAssessment do
  @moduledoc """
  Service for handling risk assessment calculations and approvals.
  """

  @risk_criteria %{
    has_job: 4,
    consistent_job: 2,
    owns_home: 2,
    owns_car: 1,
    additional_income: 2
  }

  @approval_threshold 6

  def assess(params) do
    points = calculate_points(params)
    approved = points > @approval_threshold

    %{
      points: points,
      approved: approved,
      message: get_message(approved)
    }
  end

  defp calculate_points(params) do
    @risk_criteria
    |> Enum.reduce(0, fn {key, points}, acc ->
      if Map.get(params, Atom.to_string(key), false) do
        acc + points
      else
        acc
      end
    end)
  end

  defp get_message(true), do: "You qualify for the next step!"
  defp get_message(false), do: "Thank you for your answer. We are currently unable to issue credit to you."
end