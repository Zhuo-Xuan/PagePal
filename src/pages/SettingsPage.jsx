import { Sparkles, Bold } from "lucide-react";
import SectionLabel from "../components/SectionLabel.jsx";
import OptionRow from "../components/OptionRow.jsx";
import { ALICE_TEXT, FONTS, SURFACES } from "../data/constants.js";
import { getEfficiencyInsight } from "../hooks/useReadingAnalytics.js";
import { renderParagraph } from "../utils/textFormatting.jsx";

export default function SettingsPage({ customization, setCustomization }) {
  const insight = getEfficiencyInsight();
  const surface = SURFACES[customization.surface];

  return (
    <div className="page-wrap">
      <div className="section-eyebrow">Customization</div>
      <div className="section-title">Reading settings</div>
      <div className="section-sub">Adjust font, size, and background to what feels best for you.</div>

      <div className="settings-grid">
        <div>
          <SectionLabel>Font</SectionLabel>
          <div className="option-list">
            {Object.entries(FONTS).map(([key, f]) => (
              <OptionRow
                key={key}
                active={customization.font === key}
                onClick={() => setCustomization((c) => ({ ...c, font: key }))}
                title={f.label}
                sub={f.note}
                style={{ fontFamily: f.stack }}
              />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Surface</SectionLabel>
          <div className="option-list">
            {Object.entries(SURFACES).map(([key, s]) => (
              <OptionRow
                key={key}
                active={customization.surface === key}
                onClick={() => setCustomization((c) => ({ ...c, surface: key }))}
                title={s.label}
                swatch={s.bg}
              />
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <SectionLabel>Text size — {customization.fontSize}px</SectionLabel>
        <input
          type="range"
          min={14}
          max={26}
          value={customization.fontSize}
          onChange={(e) => setCustomization((c) => ({ ...c, fontSize: Number(e.target.value) }))}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: 28 }}>
        <SectionLabel>Reading aids</SectionLabel>
        <div className="option-list">
          <OptionRow
            active={customization.boldFirstSentence}
            onClick={() => setCustomization((c) => ({ ...c, boldFirstSentence: !c.boldFirstSentence }))}
            title="Bold the first sentence of each paragraph"
            sub="Helps you re-find your place after a break in focus"
            icon={Bold}
          />
        </div>
      </div>

      <SectionLabel>Live preview</SectionLabel>
      <div
        className="settings-preview"
        style={{
          background: surface.bg,
          color: surface.text,
          fontFamily: FONTS[customization.font].stack,
          fontSize: customization.fontSize,
        }}
      >
        {renderParagraph(ALICE_TEXT[0], customization.boldFirstSentence)}
      </div>

      <div className="insight-card">
        <div className="insight-card-header">
          <Sparkles size={15} color="var(--lantern)" />
          <div className="insight-card-title">Focus insight</div>
        </div>
        <div className="insight-card-body">
          {insight ?? (
            <>
              After a few reading sessions, this card will show which font, size, and background
              helped you read fastest. Sessions are tracked locally in your browser for now.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
