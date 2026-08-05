import { Home as HomeIcon, Settings as SettingsIcon } from "lucide-react";
import Lantern from "./Lantern.jsx";
import IconButton from "./IconButton.jsx";

export default function Nav({ page, setPage, streak }) {
  return (
    <nav className="app-nav">
      <div className="nav-brand" onClick={() => setPage("home")}>
        <Lantern streak={streak} size={40} />
        <div>
          <div className="nav-brand-title">Reading Nook</div>
          <div className="nav-brand-sub">{streak}-day streak</div>
        </div>
      </div>
      <div className="nav-actions">
        <IconButton icon={HomeIcon} active={page === "home"} onClick={() => setPage("home")} label="Home" />
        <IconButton icon={SettingsIcon} active={page === "settings"} onClick={() => setPage("settings")} label="Settings" />
      </div>
    </nav>
  );
}
