
import { useEffect, useState } from "react";
import AppRouter from "./routes/AppRouter";
import LoadingScreen from "./components/LoadingScreen";
import NavigationLoader from "./components/NavigationLoader";

function App() {
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const inicio = window.setTimeout(() => {
      setCargando(false);
    }, 900);

    return () => window.clearTimeout(inicio);
  }, []);

  if (cargando) {
    return <LoadingScreen />;
  }

  return (
    <>
      <NavigationLoader />
      <AppRouter />
    </>
  );
}

export default App;
