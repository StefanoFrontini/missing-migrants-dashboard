import { useMemo } from "react";
import { max, geoNaturalEarth1, geoPath, geoGraticule, scaleSqrt } from "d3";
import { CleanData } from "../../context/useData";

const projection = geoNaturalEarth1();
const path = geoPath(projection);
const graticule = geoGraticule();

interface Props {
  data: CleanData[];
  filteredData: CleanData[] | null;
  worldAtlas: any;
  mapRef: React.MutableRefObject<null>;
}
const sizeValue = (d: CleanData) => d.total_dead_missing;

const maxRadius = 15;

const BubbleMap: React.FC<Props> = ({
  data,
  filteredData,
  worldAtlas: { land, interiors },
  mapRef,
}) => {
  const sizeScale = useMemo(
    () =>
      scaleSqrt()
        .domain([0, max(data, sizeValue)] as [number, number])
        .range([0, maxRadius]),
    [data, sizeValue, maxRadius]
  );

  return (
    <g ref={mapRef}>
      {useMemo(
        () => (
          <>
            <path
              className="fill-[#fbfbfb]"
              d={path({ type: "Sphere" }) ?? undefined}
            />
            <path
              className="fill-none stroke-[#ececec]"
              d={path(graticule()) ?? undefined}
            />
            {land.features.map((feature: any) => (
              <path
                className="fill-[#ececec] "
                key={feature.type}
                d={path(feature) ?? undefined}
              />
            ))}
            <path
              className="fill-none stroke-[#d9dfe0]"
              d={path(interiors) ?? undefined}
            />
          </>
        ),
        [path, graticule, land, interiors]
      )}
      {filteredData &&
        filteredData.map((d, index) => {
          if (d.lng && d.lat) {
            const result = projection([d.lng, d.lat]);
            const x = result![0];
            const y = result![1];
            return (
              <circle
                className="fill-[#137B80] opacity-30"
                key={index}
                cx={x}
                cy={y}
                r={sizeScale(sizeValue(d) ?? 0)}
              />
            );
          }
        })}
    </g>
  );
};
export default BubbleMap;
