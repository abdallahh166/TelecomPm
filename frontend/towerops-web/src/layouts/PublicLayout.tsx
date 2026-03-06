import { Outlet } from "react-router-dom";
import { initI18n } from "../i18n";

initI18n();

export function PublicLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-d-bg text-d-text font-sans">
      <Outlet />
    </div>
  );
}
