import WebtoonPanel from "../../../../../components/consultation/WebtoonPanel";
import { generateSectionContent } from "../../../../../lib/consultation-content-generator";

export default function Section3FiveElements({ consultation }) {
  return (
    <div className="section-container">
      <div className="card-header">
        <h3 className="card-title">섹션 3 - 오행 균형</h3>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <WebtoonPanel
          sectionNumber={3}
          consultation={consultation}
          {...generateSectionContent(consultation, 3)}
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