import React, { ReactNode } from "react";
import { useData } from "./useData";
import { useWorldAtlas } from "./useWorldAtlas";
import type { CleanData } from "./useData";

interface Props {
  children?: ReactNode;
}

export interface ErrorType {
  show: Boolean;
  msg: string;
}

interface DataContextType {
  data: CleanData[] | null;
  isLoading: Boolean;
  errorData: ErrorType;
  errorWorldAtlas: ErrorType;
  worldAtlas: any;
}

const DataContext = React.createContext<DataContextType | undefined>(undefined);

const DataProvider: React.FC<Props> = ({ children }) => {
  const { data, isLoading: isLoadingData, error: errorData } = useData();
  const {
    data: worldAtlas,
    isLoading: isLoadingWorldAtlas,
    error: errorWorldAtlas,
  } = useWorldAtlas();

  const isLoading = isLoadingData || isLoadingWorldAtlas;

  return (
    <DataContext.Provider
      value={{
        data,
        isLoading,
        errorData,
        errorWorldAtlas,
        worldAtlas,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

const useDataContext = () => {
  const dataContext = React.useContext(DataContext);
  if (!dataContext)
    throw new Error(
      "No DataContext.Provider found when calling useDataContext."
    );
  return dataContext;
};

export { useDataContext, DataProvider };
