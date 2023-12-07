import React, {useContext, createContext, useState } from "react";

interface userDetails {
  name: string,
  email: string,
  address: string
}

interface UserContextValue {
  userDetails: userDetails | null;
  updateUserDetails: (details: userDetails) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: {children: React.ReactNode}) {
  const [userDetails, setUserDetails] = useState<userDetails | null>(null);

  const updateUserDetails = (newDetails: userDetails) => {
    setUserDetails(newDetails);
  }

  return (
    <UserContext.Provider value={{userDetails, updateUserDetails}}>
      { children }
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context;
}
