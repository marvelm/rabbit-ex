defmodule Rabbit.HangoutChannel do
  use Phoenix.Channel

  def join("hangout:" <> stream_id, _message, socket) do
    {:ok, socket}
  end

  def handle_in("offer", %{"offer" => offer}, socket) do
    broadcast_from! socket, "offer", %{offer: offer}
    {:noreply, socket}
  end

  def handle_in("answer", %{"answer" => answer}, socket) do
    broadcast_from! socket, "answer", %{answer: answer}
    {:noreply, socket}
  end

  def handle_in("ice_candidate", %{"candidate" => candidate}, socket) do
    broadcast_from! socket, "ice_candidate", %{candidate: candidate}
    {:noreply, socket}
  end
end
