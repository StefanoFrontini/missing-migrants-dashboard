import { useEffect, useState } from "react";
import { dsv, DSVRaw } from "d3";

const csvUrl =
  "https://gist.githubusercontent.com/StefanoFrontini/94424c58cce5781ec8bc7f46150a53f7/raw/06b17c179260b5bd74d0eba2ec32e0e1619a42c5/missing-migrants.csv";

const delimiter = ";";

interface APIData {
  "Total Number of Dead and Missing": string | undefined;
  "Website Date": string | undefined;
  Coordinates: string | undefined;
}

export interface CleanData {
  total_dead_missing: number;
  date: Date | null;
  lat: number | null;
  lng: number | null;
}

export const useData = () => {
  const [data, setData] = useState<CleanData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({ show: false, msg: "" });

  const toggleError = (show = false, msg = "") => {
    setError({ show, msg });
  };

  useEffect(() => {
    const myRegex = /-*[0-9]+\.*[0-9]*/g;

    const row = (d: APIData): CleanData => {
      const [lng, lat] = d["Coordinates"]
        ? d["Coordinates"].match(myRegex)!
        : [null, null];

      return {
        total_dead_missing: d["Total Number of Dead and Missing"]
          ? +d["Total Number of Dead and Missing"]
          : 0,
        date: d["Website Date"] ? new Date(d["Website Date"]) : null,
        lat: lat ? +lat : null,
        lng: lng ? +lng : null,
      };
    };

    const getData = async (
      delimiter: string,
      url: string,
      cb: (row: DSVRaw<APIData>) => CleanData
    ) => {
      setIsLoading(true);
      try {
        let data = await dsv(delimiter, url, cb);
        setData(data);
      } catch (error) {
        console.log(error);
        toggleError(true, "Error!");
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    };

    getData(delimiter, csvUrl, row);
  }, []);

  return { data, isLoading, error };
};
