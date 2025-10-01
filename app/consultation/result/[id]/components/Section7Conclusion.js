import WebtoonPanel from "../../../../../components/consultation/WebtoonPanel";
import { generateSectionContent } from "../../../../../lib/consultation-content-generator";

export default function Section7Conclusion({ consultation }) {
  return (
    <div>
      <div className="card-header">
        <h3 className="card-title">섹션 7 - 종합 결론</h3>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <WebtoonPanel
          sectionNumber={7}
          consultation={consultation}
          {...generateSectionContent(consultation, 7)}
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