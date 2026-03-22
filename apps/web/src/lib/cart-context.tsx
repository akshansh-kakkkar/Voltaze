"use client";

import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";

export interface CartItem {
	tierId: string;
	tierName: string;
	price: number;
	quantity: number;
	eventId: string;
	eventSlug: string;
}

interface CartContextType {
	items: CartItem[];
	total: number;
	addItem: (item: CartItem) => void;
	updateQuantity: (tierId: string, quantity: number) => void;
	removeItem: (tierId: string) => void;
	clear: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([]);

	const total = items.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);

	const addItem = useCallback((item: CartItem) => {
		setItems((prev) => {
			const wrongEvent = prev.length > 0 && prev[0].eventId !== item.eventId;
			const base = wrongEvent ? [] : prev;
			const existing = base.find((i) => i.tierId === item.tierId);
			if (existing) {
				return base.map((i) =>
					i.tierId === item.tierId
						? { ...i, quantity: i.quantity + item.quantity }
						: i,
				);
			}
			return [...base, item];
		});
	}, []);

	const updateQuantity = useCallback((tierId: string, quantity: number) => {
		setItems((prev) => {
			if (quantity <= 0) {
				return prev.filter((i) => i.tierId !== tierId);
			}
			return prev.map((i) => (i.tierId === tierId ? { ...i, quantity } : i));
		});
	}, []);

	const removeItem = useCallback((tierId: string) => {
		setItems((prev) => prev.filter((i) => i.tierId !== tierId));
	}, []);

	const clear = useCallback(() => {
		setItems([]);
	}, []);

	return (
		<CartContext.Provider
			value={{ items, total, addItem, updateQuantity, removeItem, clear }}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
