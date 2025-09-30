import WebtoonPanel from "../../../../../components/consultation/WebtoonPanel";
import { generateSectionContent } from "../../../../../lib/consultation-content-generator";

export default function Section2TenGods({ consultation }) {
  return (
    <div className="section-container">
      <div className="card-header">
        <h3 className="card-title">섹션 2 - 십신 분석</h3>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <WebtoonPanel
          sectionNumber={2}
          consultation={consultation}
          {...generateSectionContent(consultation, 2)}
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