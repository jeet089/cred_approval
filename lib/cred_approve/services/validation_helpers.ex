defmodule CredApprove.Services.ValidationHelpers do
  @moduledoc """
  Service for common validation functions.
  """

  def parse_number(value) when is_number(value), do: {:ok, value}
  def parse_number(value) when is_binary(value) do
    case Float.parse(value) do
      {num, ""} -> {:ok, num}
      _ ->
        case Integer.parse(value) do
          {num, ""} -> {:ok, num}
          _ -> {:error, :invalid_number}
        end
    end
  end
  def parse_number(_), do: {:error, :invalid_number}

  def valid_email?(email) when is_binary(email) do
    email_regex = ~r/^[^\s]+@[^\s]+\.[^\s]+$/
    Regex.match?(email_regex, email)
  end
  def valid_email?(_), do: false
end