import WebtoonPanel from "../../../../../components/consultation/WebtoonPanel";
import { generateSectionContent } from "../../../../../lib/consultation-content-generator";

export default function Section6Advice({ consultation }) {
  return (
    <div>
      <div className="card-header">
        <h3 className="card-title">섹션 6 - 조언 및 가이드</h3>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <WebtoonPanel
          sectionNumber={6}
          consultation={consultation}
          {...generateSectionContent(consultation, 6)}
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