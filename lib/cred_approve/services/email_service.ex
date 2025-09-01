defmodule CredApprove.Services.EmailService do
  @moduledoc """
  Service for handling email generation and sending.
  """

  alias CredApprove.Mailer
  alias CredApprove.Services.ValidationHelpers
  alias Swoosh.Email

  def send_approval(email, risk_assessment, financial_info, credit_amount) do
    if ValidationHelpers.valid_email?(email) do
      case generate_and_send_email(email, risk_assessment, financial_info, credit_amount) do
        :ok ->
          {:ok, "PDF has been sent to your email address"}
        
        {:error, reason} ->
          {:error, "Failed to send email: #{inspect(reason)}"}
      end
    else
      {:error, "Invalid email address"}
    end
  end

  defp generate_and_send_email(email, risk_assessment, financial_info, credit_amount) do
    try do
      email_body = generate_email_content(risk_assessment, financial_info, credit_amount)
      
      pdf_binary = case generate_pdf_binary(risk_assessment, financial_info, credit_amount) do
        {:ok, pdf} -> pdf
        {:error, _} -> nil
      end
      
      email_struct = Email.new()
      |> Email.to(email)
      |> Email.from("noreply@credapprove.com")
      |> Email.subject("Credit Approval Details")
      |> Email.html_body(email_body)
      |> Email.text_body("Your credit approval details are included in this email.")
      |> maybe_attach_pdf(pdf_binary)
      
      case Mailer.deliver(email_struct) do
        {:ok, _} -> :ok
        error -> error
      end
    rescue
      e -> {:error, e}
    end
  end

  defp generate_pdf_binary(risk_assessment, financial_info, credit_amount) do
    try do
      html_content = generate_email_content(risk_assessment, financial_info, credit_amount)
      
      case ChromicPDF.print_to_pdf({:html, html_content}, [
        print_options: %{
          format: "A4",
          margin_top: "1cm",
          margin_bottom: "1cm", 
          margin_left: "1cm",
          margin_right: "1cm"
        }
      ]) do
        {:ok, base64_pdf} -> 
          {:ok, Base.decode64!(base64_pdf)}
        error -> error
      end
    rescue
      e -> {:error, e}
    end
  end

  defp maybe_attach_pdf(email_struct, nil), do: email_struct
  defp maybe_attach_pdf(email_struct, pdf_binary) do
    attachment = %Swoosh.Attachment{
      filename: "credit_approval.pdf",
      content_type: "application/pdf",
      data: pdf_binary,
      type: :attachment
    }
    
    email_struct
    |> Email.attachment(attachment)
  end

  defp generate_email_content(risk_assessment, financial_info, credit_amount) do
    """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Credit Approval Details</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
            th { background-color: #f5f5f5; }
            .highlight { background-color: #e8f5e8; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1 style="color: #2563eb;">Credit Approval Details</h1>
            <p>Generated on #{DateTime.utc_now() |> DateTime.to_date()}</p>
        </div>
        
        <div class="section">
            <h3>Risk Assessment Results</h3>
            <table>
                <tr><th>Question</th><th>Answer</th><th>Points</th></tr>
                <tr><td>Do you have a paying job?</td><td>#{if risk_assessment["has_job"], do: "Yes", else: "No"}</td><td>#{if risk_assessment["has_job"], do: "4", else: "0"}</td></tr>
                <tr><td>Consistent job for past 12 months?</td><td>#{if risk_assessment["consistent_job"], do: "Yes", else: "No"}</td><td>#{if risk_assessment["consistent_job"], do: "2", else: "0"}</td></tr>
                <tr><td>Do you own a home?</td><td>#{if risk_assessment["owns_home"], do: "Yes", else: "No"}</td><td>#{if risk_assessment["owns_home"], do: "2", else: "0"}</td></tr>
                <tr><td>Do you own a car?</td><td>#{if risk_assessment["owns_car"], do: "Yes", else: "No"}</td><td>#{if risk_assessment["owns_car"], do: "1", else: "0"}</td></tr>
                <tr><td>Additional income source?</td><td>#{if risk_assessment["additional_income"], do: "Yes", else: "No"}</td><td>#{if risk_assessment["additional_income"], do: "2", else: "0"}</td></tr>
                <tr class="highlight"><td colspan="2"><strong>Total Score</strong></td><td><strong>#{risk_assessment["points"]}</strong></td></tr>
            </table>
        </div>
        
        <div class="section">
            <h3>Financial Information</h3>
            <table>
                <tr><td><strong>Monthly Income</strong></td><td>$#{financial_info["monthly_income"]}</td></tr>
                <tr><td><strong>Monthly Expenses</strong></td><td>$#{financial_info["monthly_expenses"]}</td></tr>
                <tr><td><strong>Net Monthly Income</strong></td><td>$#{financial_info["monthly_income"] - financial_info["monthly_expenses"]}</td></tr>
            </table>
        </div>
        
        <div class="section">
            <h3>Credit Approval</h3>
            <table>
                <tr class="highlight"><td><strong>Approved Credit Amount</strong></td><td><strong>$#{credit_amount}</strong></td></tr>
            </table>
        </div>
        
        <div class="section">
            <p style="color: #16a34a; font-weight: bold; font-size: 18px;">Congratulations on your credit approval!</p>
            <p><small>This document was generated automatically by the Credit Approval System.</small></p>
        </div>
    </body>
    </html>
    """
  end
end