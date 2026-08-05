export default function OptionRow({ active, onClick, title, sub, swatch, style }) {
  return (
    <div className={`option-row${active ? " active" : ""}`} onClick={onClick}>
      {swatch && <div className="option-swatch" style={{ background: swatch }} />}
      <div>
        <div className="option-title" style={style}>{title}</div>
        {sub && <div className="option-sub">{sub}</div>}
      </div>
    </div>
  );
}
