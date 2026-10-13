import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function useWebSocket(onEvent) {
  const { token, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    function connect() {
      if (!isMounted) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws${token ? `?token=${token}` : ''}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMounted) return;
        setIsConnected(true);
        if (token) {
          ws.send(JSON.stringify({ type: 'AUTHENTICATE', token }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onEvent && data.type) {
            onEvent(data);
          }
        } catch (e) {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        if (!isMounted) return;
        setIsConnected(false);
        // Exponential reconnect after 2.5s
        reconnectTimeoutRef.current = setTimeout(connect, 2500);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [token, user?.id]);

  return { isConnected };
}
