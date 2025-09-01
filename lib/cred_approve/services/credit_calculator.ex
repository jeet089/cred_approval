defmodule CredApprove.Services.CreditCalculator do
  @moduledoc """
  Service for calculating credit amounts based on financial information.
  """

  alias CredApprove.Services.ValidationHelpers

  def calculate(monthly_income, monthly_expenses) do
    with {:ok, income} <- ValidationHelpers.parse_number(monthly_income),
         {:ok, expenses} <- ValidationHelpers.parse_number(monthly_expenses),
         :ok <- validate_non_negative(income, expenses) do
      
      net_monthly = income - expenses
      credit_amount = net_monthly * 12

      {:ok, %{
        net_monthly_income: net_monthly,
        credit_amount: credit_amount,
        message: "Congratulations, you have been approved for credit up to $#{credit_amount} USD"
      }}
    else
      {:error, :invalid_number} ->
        {:error, "Invalid income or expense amount"}
      
      {:error, :negative_values} ->
        {:error, "Income and expenses must be non-negative numbers"}
    end
  end

  defp validate_non_negative(income, expenses) do
    if income >= 0 and expenses >= 0 do
      :ok
    else
      {:error, :negative_values}
    end
  end
end