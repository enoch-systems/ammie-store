"use client"

import { useState, useEffect } from "react"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Image from "next/image"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useCart } from "./cart-context"

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return isMobile
}

export function CartDrawer() {
  const { items, removeItem, updateQuantity, isOpen, setIsOpen, itemCount, subtotal } = useCart()
  const isMobile = useIsMobile()

  const shipping = 0
  const total = subtotal + shipping

  return (
    <Drawer
      open={isOpen}
      onOpenChange={setIsOpen}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent
        className={
          isMobile
            ? "h-[85vh] max-h-[85vh] rounded-t-3xl border-t"
            : "h-full w-full sm:max-w-[440px]"
        }
      >
        {/* Mobile drag handle */}
        {isMobile && (
          <div className="mx-auto mt-3 mb-1 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30" />
        )}

        <DrawerHeader className="border-b border-border/50 p-4 sm:p-6 py-2.5">
          <DrawerTitle className="font-serif text-xl sm:text-2xl">Cart</DrawerTitle>
          <DrawerDescription>{itemCount} {itemCount === 1 ? 'item' : 'items'}</DrawerDescription>
        </DrawerHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <DrawerClose asChild>
                <button
                  type="button"
                  className="mt-4 text-primary hover:underline text-sm"
                >
                  Continue Shopping
                </button>
              </DrawerClose>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 sm:gap-4">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-sm sm:text-base text-foreground mb-0.5 sm:mb-1 font-semibold leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-muted-foreground mb-2 sm:mb-3 text-xs sm:text-sm">
                      Premium quality hair product
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex items-center border border-border rounded-full">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 sm:p-1.5 hover:bg-muted boty-transition rounded-l-full touch-manipulation"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                        </button>
                        <span className="px-3 sm:px-3 text-sm font-medium min-w-[1.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 sm:p-1.5 hover:bg-muted boty-transition rounded-r-full touch-manipulation"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-2.5 sm:p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 boty-transition rounded-full touch-manipulation"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-foreground text-sm sm:text-base whitespace-nowrap">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <DrawerFooter className="border-t border-border/50 p-4 sm:p-6 gap-3 sm:gap-4">
            {/* Summary */}
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₦${shipping}`}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-medium text-foreground pt-2 sm:pt-2 border-t border-border/50">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              type="button"
              className="w-full bg-primary text-primary-foreground py-3.5 sm:py-4 rounded-full font-medium text-sm sm:text-base hover:bg-primary/90 boty-transition active:scale-[0.98] transition-transform touch-manipulation"
            >
              Checkout
            </button>

            <DrawerClose asChild>
              <button
                type="button"
                className="w-full border border-border text-foreground py-3.5 sm:py-4 rounded-full font-medium text-sm sm:text-base hover:bg-muted boty-transition active:scale-[0.98] transition-transform touch-manipulation"
              >
                Continue Shopping
              </button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}