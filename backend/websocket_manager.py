import asyncio

from fastapi import WebSocket


class ConnectionManager:
    """Mantém as conexões WebSocket ativas e publica eventos para o mercado."""

    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict) -> None:
        # Envia em paralelo; conexões que falharem são removidas para broadcasts futuros.
        connections = list(self.active_connections)
        if not connections:
            return

        results = await asyncio.gather(
            *(websocket.send_json(message) for websocket in connections),
            return_exceptions=True,
        )

        for websocket, result in zip(connections, results):
            if isinstance(result, Exception):
                self.disconnect(websocket)
