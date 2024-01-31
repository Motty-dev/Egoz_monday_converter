import React from 'react';
import useSSE from './hooks/useSSE';

function App() {
  const data = useSSE('http://localhost:8080/api/events', {});

  console.log(data); // For debugging, to see the data received from SSE

  return (
    <div className="App">
      hhhhh
          </div>
  );
}
export default App;