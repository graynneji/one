import React, { createContext, useContext, useState } from "react";

const PatientInfoContext = createContext<any>(null)


export const PatientInfoProvider = ({ children }: { children: React.ReactNode }) => {
    const [patient, setPatient] = useState({})
    return (
        <PatientInfoContext.Provider value={{ patient, setPatient }}>
            {children}
        </PatientInfoContext.Provider>
    )
}
export const usePatientInfoContext = () => useContext(PatientInfoContext)