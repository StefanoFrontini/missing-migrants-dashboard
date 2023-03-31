import { useState, useRef, useEffect } from "react";
import { useDataContext } from "../context/context";
import Loading from "../components/Loading";
import Error from "../components/Error";
import { Bar } from "../components/Charts/Bar";
import { BubbleMap } from "../components/BubbleMap";
import type { DataNonNullDate } from "../components/Charts/Bar/Bar";
import { select, zoom } from "d3";

const xValue = (d: DataNonNullDate) => d.date;

const Dashboard = () => {
  const { isLoading, errorData, errorWorldAtlas, data, worldAtlas } =
    useDataContext();
  const [brushExtent, setBrushExtent] = useState();
  const svgWidth = 960;
  const svgHeight = 500;

  const barSize = 0.2;
  const zoomRef = useRef(null);
  const mapRef = useRef(null);

  const handleZoom = (e: any) => {
    select(mapRef.current).attr("transform", e.transform);
  };

  useEffect(() => {
    setTimeout(() => {
      const zoomBehaviour = zoom()
        .scaleExtent([1, 10])
        .translateExtent([
          [0, 0],
          [svgWidth, svgHeight],
        ]);
      if (zoomRef.current) {
        zoomBehaviour(select(zoomRef.current));
        zoomBehaviour.on("zoom", handleZoom);
      }
    }, 500);
  }, []);

  if (isLoading)
    return (
      <main>
        <Loading />
      </main>
    );

  const filteredData =
    brushExtent && data
      ? data.filter((d) => {
          if (d.date) {
            return d.date > brushExtent[0] && d.date < brushExtent[1];
          }
        })
      : data;

  return (
    <>
      {errorData.show && <Error error={errorData} />}
      {errorWorldAtlas.show && <Error error={errorWorldAtlas} />}
      <main className="max-w-screen-xl flex flex-col items-center p-6 mx-auto">
        <svg ref={zoomRef} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          {worldAtlas && data && (
            <BubbleMap
              worldAtlas={worldAtlas}
              data={data}
              filteredData={filteredData}
              mapRef={mapRef}
            />
          )}
          {data && (
            <g transform={`translate(0,${svgHeight - barSize * svgHeight})`}>
              <Bar
                data={data}
                svgWidth={svgWidth}
                svgHeight={barSize * svgHeight}
                setBrushExtent={setBrushExtent}
                xValue={xValue}
              />
            </g>
          )}
        </svg>
      </main>
    </>
  );
};

export default Dashboard;
