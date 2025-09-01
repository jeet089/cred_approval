defmodule CredApproveWeb.CreditController do
  use CredApproveWeb, :controller
  
  alias CredApprove.Services.RiskAssessment
  alias CredApprove.Services.CreditCalculator
  alias CredApprove.Services.EmailService

  def assess_risk(conn, params) do
    response = RiskAssessment.assess(params)

    conn
    |> put_status(:ok)
    |> json(response)
  end

  def calculate_credit(conn, %{"monthly_income" => monthly_income, "monthly_expenses" => monthly_expenses}) do
    case CreditCalculator.calculate(monthly_income, monthly_expenses) do
      {:ok, response} ->
        conn
        |> put_status(:ok)
        |> json(response)
      
      {:error, error_message} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: error_message})
    end
  end


  def send_approval(conn, %{
    "email" => email,
    "risk_assessment" => risk_assessment,
    "financial_info" => financial_info,
    "credit_amount" => credit_amount
  }) do
    case EmailService.send_approval(email, risk_assessment, financial_info, credit_amount) do
      {:ok, message} ->
        conn
        |> put_status(:ok)
        |> json(%{message: message})
      
      {:error, error_message} ->
        status = if String.contains?(error_message, "Invalid email") do
          :bad_request
        else
          :internal_server_error
        end
        
        conn
        |> put_status(status)
        |> json(%{error: error_message})
    end
  end
end