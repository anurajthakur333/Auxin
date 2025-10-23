import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProfileMenuContextType {
  isProfileMenuOpen: boolean;
  setIsProfileMenuOpen: (isOpen: boolean) => void;
  openProfileMenu: () => void;
  closeProfileMenu: () => void;
}

const ProfileMenuContext = createContext<ProfileMenuContextType | undefined>(undefined);

export const useProfileMenu = () => {
  const context = useContext(ProfileMenuContext);
  if (context === undefined) {
    throw new Error('useProfileMenu must be used within a ProfileMenuProvider');
  }
  return context;
};

interface ProfileMenuProviderProps {
  children: ReactNode;
}

export const ProfileMenuProvider: React.FC<ProfileMenuProviderProps> = ({ children }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const openProfileMenu = () => setIsProfileMenuOpen(true);
  const closeProfileMenu = () => setIsProfileMenuOpen(false);

  const value = {
    isProfileMenuOpen,
    setIsProfileMenuOpen,
    openProfileMenu,
    closeProfileMenu,
  };

  return (
    <ProfileMenuContext.Provider value={value}>
      {children}
    </ProfileMenuContext.Provider>
  );
};
