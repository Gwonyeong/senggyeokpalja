import WebtoonPanel from "../../../../../components/consultation/WebtoonPanel";
import { generateSectionContent } from "../../../../../lib/consultation-content-generator";

export default function Section4Personality({ consultation }) {
  return (
    <div className="section-container">
      <div className="card-header">
        <h3 className="card-title">섹션 4 - 성격 분석</h3>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <WebtoonPanel
          sectionNumber={4}
          consultation={consultation}
          {...generateSectionContent(consultation, 4)}
          panelStyle={{
            minHeight: "600px",
            background: "transparent",
            border: "none",
            borderRadius: "0",
          }}
        />
      </div>
    </div>
  );
}