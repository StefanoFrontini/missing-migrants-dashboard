import { timeFormat, ScaleTime } from "d3";
const formatTime = timeFormat("%m/%d/%Y");

// const formatNumber = format(",d");
interface Props {
  xScale: ScaleTime<number, number>;
  innerHeight: number;
}

const AxisBottom: React.FC<Props> = ({ xScale, innerHeight }) => {
  const ticks = xScale.ticks();

  const offset = 5;
  return (
    <>
      {ticks.map((tickValue, index) => {
        return (
          <g
            transform={`translate(${xScale(tickValue)}, ${
              innerHeight + offset
            })`}
            key={index}
          >
            <text
              alignmentBaseline="hanging"
              textAnchor="middle"
              fontSize="0.5rem"
              className="capitalize"
              fill="#6B6C7D"
            >
              {formatTime(tickValue)}
            </text>
          </g>
        );
      })}
    </>
  );
};

export default AxisBottom;
