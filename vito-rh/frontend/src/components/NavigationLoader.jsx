
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";

export default function NavigationLoader() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);

    const timeout = window.setTimeout(() => {
      setVisible(false);
    }, 650);

    return () => window.clearTimeout(timeout);
  }, [location.pathname]);

  if (!visible) return null;

  return <LoadingScreen />;
}
