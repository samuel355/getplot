'use client'
import { useParams } from 'next/navigation';
import React from 'react'

const PlotDetails = () => {
  const { plotId } = useParams();
  console.log(plotId)
  return (
    <div>
      <div className="pb-2 w-full bg-white">
        <h1 className="text-primary font-bold text-2xl">Edit Plot</h1>
      </div>
    </div>
  )
}

export default PlotDetails
