export default function IconButton({ icon: Icon, active, onClick, label }) {
  return (
    <button className={`nav-btn${active ? " active" : ""}`} onClick={onClick} title={label}>
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}
