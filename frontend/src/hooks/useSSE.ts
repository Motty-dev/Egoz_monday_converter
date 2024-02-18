import { useState, useEffect } from 'react';

const useSSE = (url: string, initialState: any) => {
  const [data, setData] = useState(initialState);

  useEffect(() => {
    const eventSource = new EventSource(url);
    eventSource.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
      setData(parsedData);
    };
    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
    };
    return () => eventSource.close();
  }, [url]);

  return data;
};

export default useSSE;