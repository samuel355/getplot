import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const ListItem = ({ href, title, children }) => {
  const path = usePathname();
  return (
    <div className="w-full">
      <Link
        href={href}
        className={`hover:text-primary hover:bg-gray-50 py-1 px-2 rounded-md text-base w-full ${
          path === href && "text-primary font-semibold"
        }`}
        title={title}
      >
        {children}
      </Link>
    </div>
  );
};

export default ListItem;
