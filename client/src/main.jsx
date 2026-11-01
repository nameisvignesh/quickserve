import React from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import App from "./App.jsx";
import "./styles.css";
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const app = publishableKey ? <ClerkProvider publishableKey={publishableKey}><App /></ClerkProvider> : <App />;
createRoot(document.getElementById("root")).render(<React.StrictMode>{app}</React.StrictMode>);
