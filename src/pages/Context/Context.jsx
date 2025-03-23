import React, { createContext, useReducer } from 'react';
import { reducer } from './Reducer';

export const GlobalContext = createContext(null);

const initialState = {
    user: {},
    isLogin: false,
  
};

export default function ContextProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <GlobalContext.Provider value={{ state, dispatch }}>
            {children}
        </GlobalContext.Provider>
    );
}