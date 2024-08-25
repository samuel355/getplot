import Link from 'next/link'
import { usePathname } from 'next/navigation';
import React from 'react'

const ListItem = ({href, title, children}) => {
  const path = usePathname();
  return (
    <div>
      <Link href={href} className={`hover:text-primary text-base ${path === href && "text-primary font-extrabold"}`} title={title}>{children}</Link>
    </div>
  )
}

export default ListItem