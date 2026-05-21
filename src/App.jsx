import { useState } from "react";
import "@/App.css";
import { Toaster } from "sonner";
import AppSelector from "@/components/AppSelector";
import Calculator from "@/components/Calculator";

const APP_KEY = "gigguard.app.v1";

function App() {
  const [appId, setAppIdState] = useState(() => {
    try {
      return localStorage.getItem(APP_KEY) || null;
    } catch {
      return null;
    }
  });
  const setAppId = (id) => {
    setAppIdState(id);
    try {
      if (id) localStorage.setItem(APP_KEY, id);
      else localStorage.removeItem(APP_KEY);
    } catch {}
  };

  return (
    <div className="App">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            border: "3px solid #000",
            boxShadow: "4px 4px 0 #000",
            borderRadius: 10,
            background: "#fff",
            color: "#111",
            fontWeight: 700,
          },
        }}
      />
      {appId ? (
        <Calculator appId={appId} onBack={() => setAppId(null)} />
      ) : (
        <AppSelector onSelect={setAppId} />
      )}
    </div>
  );
}

export default App;