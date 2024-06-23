import React, {createContext} from "react";

interface NotebookContextType {
    day: any;
    setDay: React.Dispatch<React.SetStateAction<any>>;
}

export const NotebookContext = createContext<NotebookContextType>({
    day: null,
    setDay: () => {
    },
});