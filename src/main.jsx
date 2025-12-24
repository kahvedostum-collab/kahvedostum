import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "@/lib/i18n";
import App from "./App.jsx";
import store from "./store";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Slide, ToastContainer } from "react-toastify";
import { injectCafeStore } from "@/services/signalRService";
import { setCafeSession, setCafeConnected, setCafeUsers } from "@/slice/KDSlice";
import { loadCafeSession, isSessionExpired, clearCafeSession } from "@/services/cafeStorageService";

// Inject Redux store into SignalR service for global cafe connection management
injectCafeStore(store, { setCafeConnected, setCafeUsers });

// Hydrate cafe session from localStorage on app start
const storedSession = loadCafeSession();
if (storedSession && !isSessionExpired(storedSession)) {
  store.dispatch(setCafeSession(storedSession));
} else if (storedSession) {
  // Session exists but expired - clean up
  clearCafeSession();
}

createRoot(document.getElementById("root")).render(
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <App />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss={false}
              draggable={false}
              pauseOnHover
              theme="colored"
              transition={Slide}
              style={{
                fontSize: "14px",
                fontFamily: "Poppins",
                zIndex: 999999,
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
);
