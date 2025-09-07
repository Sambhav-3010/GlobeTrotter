"use client"

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon, CheckCircledIcon, InfoCircledIcon } from "@radix-ui/react-icons";

type AlertType = "default" | "destructive" | "success" | "info";

interface AlertState {
  isOpen: boolean;
  message: string;
  title?: string;
  type: AlertType;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType, title?: string) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    message: "",
    title: undefined,
    type: "default",
  });

  const showAlert = (message: string, type: AlertType = "default", title?: string) => {
    setAlert({
      isOpen: true,
      message,
      title,
      type,
    });
  };

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  };

  const getIcon = (type: AlertType) => {
    switch (type) {
      case "destructive":
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case "success":
        return <CheckCircledIcon className="h-4 w-4" />;
      case "info":
        return <InfoCircledIcon className="h-4 w-4" />;
      case "default":
      default:
        return null;
    }
  };

  const getVariant = (type: AlertType) => {
    if (type === "destructive") return "destructive";
    return "default";
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alert.isOpen && (
        <div className="fixed bottom-4 right-4 z-10 w-full max-w-sm bg-white rounded-lg flex items-center justify-center">
          <Alert variant={getVariant(alert.type)} className={
            alert.type === "success" ? "border-green-500 text-green-700 dark:border-green-700 [&>svg]:text-green-700"
            : alert.type === "info" ? "border-blue-500 text-blue-700 dark:border-blue-700 [&>svg]:text-blue-700"
            : ""
          }>
            {getIcon(alert.type)}
            {alert.title && <AlertTitle>{alert.title}</AlertTitle>}
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};
