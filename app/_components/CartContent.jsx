import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCart } from "@/store/useStore";
import React from "react";

const CartContent = ({ open, setOpen }) => {

  const {plots} = useCart
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button aria-label="Toggle menu"></button>
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
};

export default CartContent;
