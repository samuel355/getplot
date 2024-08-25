import Link from 'next/link'
import { usePathname } from 'next/navigation';
import React from 'react'

const ListItem = ({href, title, children}) => {
  const path = usePathname();
  return (
    <div>
      <Link href={href} className={`hover:text-primary hover:bg-slate-50 px-5 py-[10px] rounded-md text-base ${path === href && "text-primary font-semibold"}`} title={title}>{children}</Link>
    </div>
  )
}

export default ListItem