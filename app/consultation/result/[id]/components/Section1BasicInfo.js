import FiveElementsChart from "../../../../../components/consultation/FiveElementsChart";
import WebtoonPanel from "../../../../../components/consultation/WebtoonPanel";
import { generateSectionContent } from "../../../../../lib/consultation-content-generator";

export default function Section1BasicInfo({ consultation }) {
  return (
    <div className="section-container">
      <div className="card-header">
        <h3 className="card-title">섹션 1 - 사주팔자 기본 정보</h3>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <WebtoonPanel
          sectionNumber={1}
          consultation={consultation}
          {...generateSectionContent(consultation, 1)}
          panelStyle={{
            minHeight: "600px",
            background: "transparent",
            border: "none",
            borderRadius: "0",
          }}
        />
      </div>
      <FiveElementsChart consultation={consultation} />
    </div>
  );
}
