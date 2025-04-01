import { useState, useEffect } from "react";
import LoadingScreen from "./components/LoadingScreen";
import MainContent from "./components/MainContent";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading ? <LoadingScreen /> : <MainContent />}
    </>
  );
}

export default App;
