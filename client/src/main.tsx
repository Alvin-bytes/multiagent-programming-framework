import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add no-transitions class to prevent theme transition flicker during page load
document.documentElement.classList.add('no-transitions');

// Render the app
createRoot(document.getElementById("root")!).render(<App />);

// Remove no-transitions class after a short delay to enable smooth transitions
setTimeout(() => {
  document.documentElement.classList.remove('no-transitions');
}, 300);
