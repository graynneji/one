import React, { createContext, useContext, useState } from "react";

const PatientIdContext = createContext<any>(null)


export const PatientIdProvider = ({ children }: { children: React.ReactNode }) => {
    const [patientId, setPatientId] = useState("")
    return (
        <PatientIdContext.Provider value={{ patientId, setPatientId }}>
            {children}

        </PatientIdContext.Provider>
    )
}
export const usePatientIdContext = () => useContext(PatientIdContext)