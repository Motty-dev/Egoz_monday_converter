import React, { useEffect } from 'react';
import useSSE  from './hooks/useSSE';

function App() {
  const data = useSSE('http://localhost:8080/api/events', {});

  useEffect(() => {
    console.log(data);
  }, [data]); 

  return (
    <div className="App">
      {JSON.stringify(data, null, 2)}
      hhhhh
    </div>
  );
}
export default App;