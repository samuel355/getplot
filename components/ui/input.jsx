import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-lg border border-input bg-white px-4 py-2 text-sm shadow-sm ring-offset-background transition-all placeholder:text-muted-foreground focus-visible:border-brand-teal focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-teal/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
