import React, { createContext, useCallback, useContext, useRef } from 'react';

// Context to manage open swipeable items
interface SwipeableContextType {
    openItemId: string | null;
    setOpenItemId: (id: string | null) => void;
    registerCloseCallback: (id: string, callback: () => void) => void;
    unregisterCloseCallback: (id: string) => void;
}

const SwipeableContext = createContext<SwipeableContextType | null>(null);

/**
 * Provider component to manage swipeable items in a list
 * Ensures only one item can be open at a time
 */
export const SwipeableListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const openItemIdRef = useRef<string | null>(null);
    const closeCallbacksRef = useRef<Map<string, () => void>>(new Map());

    const setOpenItemId = useCallback((id: string | null) => {
        // Close previously open item
        if (openItemIdRef.current && openItemIdRef.current !== id) {
            const closeCallback = closeCallbacksRef.current.get(openItemIdRef.current);
            if (closeCallback) {
                closeCallback();
            }
        }
        openItemIdRef.current = id;
    }, []);

    const registerCloseCallback = useCallback((id: string, callback: () => void) => {
        closeCallbacksRef.current.set(id, callback);
    }, []);

    const unregisterCloseCallback = useCallback((id: string) => {
        closeCallbacksRef.current.delete(id);
    }, []);

    return (
        <SwipeableContext.Provider
            value={{
                openItemId: openItemIdRef.current,
                setOpenItemId,
                registerCloseCallback,
                unregisterCloseCallback,
            }}
        >
            {children}
        </SwipeableContext.Provider>
    );
};

/**
 * Hook to use swipeable context
 */
export const useSwipeableList = () => {
    const context = useContext(SwipeableContext);
    if (!context) {
        throw new Error('useSwipeableList must be used within SwipeableListProvider');
    }
    return context;
};
