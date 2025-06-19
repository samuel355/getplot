import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/store/useStore";
import React from "react";
import CartItem from "./CartItem";
import Link from "next/link";

const CartContent = ({ open, setOpen }) => {
  const { plots, clearCart } = useCart();
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button aria-label="Toggle menu"></button>
      </DropdownMenuTrigger>

      {plots.length <= 0 ? (
        <DropdownMenuContent className="flex justify-center items-center p-2 border-t border-gray-200">
          <small>Your cart is empty</small>
        </DropdownMenuContent>
      ) : (
        <>
          <DropdownMenuContent className="w-72 mt-2 mr-2">
            <div className="space-y-2 max-h-72 overflow-y-scroll mb-2">
              {plots.map((plot) => (
                <CartItem plot={plot} />
              ))}
            </div>

            <div className="flex justify-between items-center p-2 border-t border-gray-200">
              <small
                onClick={() => {
                  clearCart();
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                Clear Cart
              </small>
              <Link className="text-sm hover:underline mt-2" href={"/checkout"}>
                View Cart
              </Link>
            </div>
          </DropdownMenuContent>
        </>
      )}
    </DropdownMenu>
  );
};

export default CartContent;
