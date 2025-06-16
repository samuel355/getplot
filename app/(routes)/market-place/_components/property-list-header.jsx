"use client";

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, MapIcon, ViewColumnsIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

const PropertyListHeader = ({ propertyCount, viewMode, setViewMode, filters, onFilterChange }) => {
  const handleSortChange = (sortOption) => {
    onFilterChange({ sortBy: sortOption });
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {propertyCount} {propertyCount === 1 ? 'property' : 'properties'} found
        </h2>
        <p className="text-sm text-gray-500">
          Showing results for {filters.propertyType === 'all' ? 'all properties' : filters.propertyType + 's'} 
          {filters.location !== 'all' && ` in ${filters.location}`}
          {filters.location === 'all' && ' in All Regions'}
        </p>
      </div>

      <div className="flex space-x-2 items-center">
        {/* Sort dropdown */}
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              {filters.sortBy === 'newest' && 'Newest'}
              {filters.sortBy === 'price-asc' && 'Price (Low to High)'}
              {filters.sortBy === 'price-desc' && 'Price (High to Low)'}
              <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute left-0 md:right-0 z-10 mt-2 w-full md:w-56 origin-top-left md:origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleSortChange('newest')}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } ${
                        filters.sortBy === 'newest' ? 'font-medium text-primary' : ''
                      } block px-4 py-2 text-sm w-full text-left`}
                    >
                      Newest
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleSortChange('price-asc')}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } ${
                        filters.sortBy === 'price-asc' ? 'font-medium text-primary' : ''
                      } block px-4 py-2 text-sm w-full text-left`}
                    >
                      Price (Low to High)
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleSortChange('price-desc')}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } ${
                        filters.sortBy === 'price-desc' ? 'font-medium text-primary' : ''
                      } block px-4 py-2 text-sm w-full text-left`}
                    >
                      Price (High to Low)
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>

        {/* View mode toggle */}
        <div className="bg-white rounded-md shadow-sm ring-1 ring-inset ring-gray-300 flex">
          <button
            onClick={() => setViewMode('grid')}
            className={`hidden sm:block px-3 py-2 rounded-l-md ${
              viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'
            }`}
            title="Grid View"
          >
            <Squares2X2Icon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`hidden sm:block px-3 py-2 rounded-r-md ${
              viewMode === 'map' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'
            }`}
            title="Map View"
          >
            <MapIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyListHeader;