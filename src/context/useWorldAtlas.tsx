import { useEffect, useState } from "react";
import { json } from "d3";
import { feature, mesh } from "topojson-client";

const jsonUrl = "https://unpkg.com/world-atlas@2.0.2/countries-50m.json";

export const useWorldAtlas = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({ show: false, msg: "" });

  const toggleError = (show = false, msg = "") => {
    setError({ show, msg });
  };

  useEffect(() => {
    const getData = async (url: string) => {
      setIsLoading(true);
      try {
        const topology: any = await json(url);
        const { countries, land } = topology.objects;
        setData({
          land: feature(topology, land),
          interiors: mesh(topology, countries, (a, b) => a !== b),
        });
      } catch (error) {
        console.log(error);
        toggleError(true, "Error!");
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    };

    getData(jsonUrl);
  }, []);

  return { data, isLoading, error };
};
