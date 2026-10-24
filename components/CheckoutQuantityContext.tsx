"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type CheckoutQuantityContextValue = {
  quantity: number;
  setQuantity: (quantity: number) => void;
};

const CheckoutQuantityContext =
  createContext<CheckoutQuantityContextValue | null>(null);

export function CheckoutQuantityProvider({
  initialQuantity,
  children,
}: {
  initialQuantity: number;
  children: ReactNode;
}) {
  const [quantity, setQuantity] = useState(initialQuantity);

  return (
    <CheckoutQuantityContext.Provider value={{ quantity, setQuantity }}>
      {children}
    </CheckoutQuantityContext.Provider>
  );
}

export function useCheckoutQuantity() {
  const context = useContext(CheckoutQuantityContext);

  if (!context) {
    throw new Error(
      "useCheckoutQuantity must be used inside CheckoutQuantityProvider",
    );
  }

  return context;
}
