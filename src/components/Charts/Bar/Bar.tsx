import { useMemo, useRef, useEffect } from "react";
import {
  max,
  sum,
  timeMonths,
  bin,
  scaleTime,
  extent,
  scaleLinear,
  timeFormatDefaultLocale,
  brushX,
  select,
} from "d3";
import locale from "../../../utils/locale";
import { AxisLeft, AxisBottom } from "./index";
import { CleanData } from "../../../context/useData";

export interface DataNonNullDate extends CleanData {
  date: Date;
}
interface Props {
  data: CleanData[];
  svgWidth: number;
  svgHeight: number;
  setBrushExtent: React.Dispatch<React.SetStateAction<undefined>>;
  xValue: (d: DataNonNullDate) => Date;
}

timeFormatDefaultLocale(locale);

const yValue = (d: DataNonNullDate) => d.total_dead_missing;

const margin = { top: 0, right: 30, bottom: 15, left: 30 };

const Bar: React.FC<Props> = ({
  data: rawData,
  svgWidth,
  svgHeight,
  setBrushExtent,
  xValue,
}) => {
  const innerWidth = svgWidth - margin.left - margin.right;
  const innerHeight = svgHeight - margin.top - margin.bottom;

  const data = useMemo(() => {
    return rawData.filter((el) => el["date"] !== null) as DataNonNullDate[];
  }, [rawData]);

  const xScale = useMemo(() => {
    return scaleTime()
      .domain(extent(data, xValue) as [Date, Date])
      .range([0, innerWidth]);
  }, [data, xValue, innerWidth]);

  const binGenerator = useMemo(() => {
    const [start, stop] = xScale.domain();
    return bin<DataNonNullDate, Date>()
      .value(xValue)
      .domain([start, stop])
      .thresholds(timeMonths(start, stop));
  }, [xValue, xScale]);

  const binnedData = useMemo(() => {
    return binGenerator(data).map((el) => {
      return {
        y: sum(el, yValue),
        x0: el.x0,
        x1: el.x1,
      };
    });
  }, [yValue, data]);

  const yScale = useMemo(
    () =>
      scaleLinear()
        .domain([0, max(binnedData, (d) => d.y)] as [number, number])
        .range([innerHeight, 0])
        .nice(),
    [binnedData, innerHeight]
  );
  const brushRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const brush = brushX().extent([
      [0, 0],
      [innerWidth, innerHeight],
    ]);
    if (brushRef.current) {
      brush(select(brushRef.current));
      brush.on("brush end", ({ selection }) => {
        setBrushExtent &&
          setBrushExtent(selection ? selection.map(xScale.invert) : null);
      });
    }
  }, [innerWidth, innerHeight]);

  return (
    <>
      <rect width={svgWidth} height={svgHeight} className="fill-white" />

      <g transform={`translate(${margin.left},${margin.top})`}>
        <AxisLeft yScale={yScale} innerWidth={innerWidth} />
        <AxisBottom xScale={xScale} innerHeight={innerHeight} />
        {binnedData.map((d) => {
          return (
            <g key={xScale(d.x0 ?? 0)}>
              <rect
                x={xScale(d.x0 ?? 0)}
                y={yScale(d.y)}
                width={xScale(d.x1 ?? 0) - xScale(d.x0 ?? 0)}
                height={innerHeight - yScale(d.y)}
                fill="#4C9AFF"
              >
                <title>{d.y}</title>
              </rect>
            </g>
          );
        })}
        <g ref={brushRef} />
      </g>
    </>
  );
};

export default Bar;
