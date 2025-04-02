"use client";

import { useState, Fragment } from 'react';
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react';
import { ChevronDownIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

const PropertyFilters = ({ filters, onFilterChange }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  
  const locations = [
    "All Locations",
    "Accra",
    "Kumasi",
    "East Legon Hills",
    "East Legon",
    "Legon",
    "NTHC",
    "Trabuom",
    "Yabi",
    "Dar Es Salaam"
  ];
  
  const handlePriceChange = (range) => {
    onFilterChange({ priceRange: range });
  };
  
  const handlePropertyTypeChange = (type) => {
    onFilterChange({ propertyType: type });
  };
  
  const handleLocationChange = (location) => {
    onFilterChange({ location: location === "All Locations" ? "all" : location });
  };
  
  const handleBedroomsChange = (bedrooms) => {
    onFilterChange({ bedrooms });
  };
  
  const handleBathroomsChange = (bathrooms) => {
    onFilterChange({ bathrooms });
  };
  
  const applyFilters = () => {
    // This would typically update URL parameters or make an API call
    setOpen(false);
    
    // Update URL with filter parameters
    const queryParams = new URLSearchParams();
    queryParams.set('propertyType', filters.propertyType);
    queryParams.set('minPrice', filters.priceRange[0]);
    queryParams.set('maxPrice', filters.priceRange[1]);
    queryParams.set('location', filters.location);
    if (filters.bedrooms !== 'any') queryParams.set('bedrooms', filters.bedrooms);
    if (filters.bathrooms !== 'any') queryParams.set('bathrooms', filters.bathrooms);
    
    router.push(`/market-place?${queryParams.toString()}`, { scroll: false });
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg mb-6">
      {/* Desktop filters */}
      <div className="hidden md:flex items-center justify-between p-4 border-b">
        <div className="flex space-x-6">
          {/* Property Type Filter */}
          <Popover className="relative">
            <Popover.Button className="flex items-center gap-x-1 text-sm font-medium text-gray-700 hover:text-gray-900">
              Property Type
              <ChevronDownIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <button
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      filters.propertyType === 'all' ? 'bg-gray-100 text-primary' : 'text-gray-700'
                    }`}
                    onClick={() => handlePropertyTypeChange('all')}
                  >
                    All Properties
                  </button>
                  <button
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      filters.propertyType === 'land' ? 'bg-gray-100 text-primary' : 'text-gray-700'
                    }`}
                    onClick={() => handlePropertyTypeChange('land')}
                  >
                    Land Only
                  </button>
                  <button
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      filters.propertyType === 'house' ? 'bg-gray-100 text-primary' : 'text-gray-700'
                    }`}
                    onClick={() => handlePropertyTypeChange('house')}
                  >
                    Houses
                  </button>
                </div>
              </Popover.Panel>
            </Transition>
          </Popover>

          {/* Price Range Filter */}
          <Popover className="relative">
            <Popover.Button className="flex items-center gap-x-1 text-sm font-medium text-gray-700 hover:text-gray-900">
              Price Range
              <ChevronDownIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute left-0 z-10 mt-2 w-64 origin-top-left rounded-md bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="min-price" className="block text-sm font-medium text-gray-700">
                      Minimum Price ($)
                    </label>
                    <input
                      type="number"
                      id="min-price"
                      value={filters.priceRange[0]}
                      onChange={(e) => handlePriceChange([parseInt(e.target.value), filters.priceRange[1]])}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="max-price" className="block text-sm font-medium text-gray-700">
                      Maximum Price ($)
                    </label>
                    <input
                      type="number"
                      id="max-price"
                      value={filters.priceRange[1]}
                      onChange={(e) => handlePriceChange([filters.priceRange[0], parseInt(e.target.value)])}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </Popover>

          {/* Location Filter */}
          <Popover className="relative">
            <Popover.Button className="flex items-center gap-x-1 text-sm font-medium text-gray-700 hover:text-gray-900">
              Location
              <ChevronDownIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute left-0 z-10 mt-2 w-64 max-h-96 overflow-y-auto origin-top-left rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  {locations.map((location) => (
                    <button
                      key={location}
                      className={`block px-4 py-2 text-sm w-full text-left ${
                        (location === "All Locations" && filters.location === "all") || 
                        filters.location === location 
                          ? 'bg-gray-100 text-primary' 
                          : 'text-gray-700'
                      }`}
                      onClick={() => handleLocationChange(location)}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </Popover.Panel>
            </Transition>
          </Popover>

          {/* Bedrooms Filter (only relevant for houses) */}
          {filters.propertyType !== 'land' && (
            <Popover className="relative">
              <Popover.Button className="flex items-center gap-x-1 text-sm font-medium text-gray-700 hover:text-gray-900">
                Bedrooms
                <ChevronDownIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
              </Popover.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <button
                      className={`block px-4 py-2 text-sm w-full text-left ${
                        filters.bedrooms === 'any' ? 'bg-gray-100 text-primary' : 'text-gray-700'
                      }`}
                      onClick={() => handleBedroomsChange('any')}
                    >
                      Any
                    </button>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        className={`block px-4 py-2 text-sm w-full text-left ${
                          filters.bedrooms === num ? 'bg-gray-100 text-primary' : 'text-gray-700'
                        }`}
                        onClick={() => handleBedroomsChange(num)}
                      >
                        {num}+
                      </button>
                    ))}
                  </div>
                </Popover.Panel>
              </Transition>
            </Popover>
          )}

          {/* Bathrooms Filter (only relevant for houses) */}
          {filters.propertyType !== 'land' && (
            <Popover className="relative">
              <Popover.Button className="flex items-center gap-x-1 text-sm font-medium text-gray-700 hover:text-gray-900">
                Bathrooms
                <ChevronDownIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
              </Popover.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <button
                      className={`block px-4 py-2 text-sm w-full text-left ${
                        filters.bathrooms === 'any' ? 'bg-gray-100 text-primary' : 'text-gray-700'
                      }`}
                      onClick={() => handleBathroomsChange('any')}
                    >
                      Any
                    </button>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        className={`block px-4 py-2 text-sm w-full text-left ${
                          filters.bathrooms === num ? 'bg-gray-100 text-primary' : 'text-gray-700'
                        }`}
                        onClick={() => handleBathroomsChange(num)}
                      >
                        {num}+
                      </button>
                    ))}
                  </div>
                </Popover.Panel>
              </Transition>
            </Popover>
          )}
        </div>

        <button
          onClick={applyFilters}
          className="bg-primary text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-primary-dark"
        >
          Apply Filters
        </button>
      </div>

      {/* Mobile filters */}
      <div className="md:hidden p-4">
        <button
          type="button"
          className="flex w-full items-center justify-between bg-white py-2 text-gray-700"
          onClick={() => setOpen(true)}
        >
          <span className="text-sm font-medium">Filters</span>
          <AdjustmentsHorizontalIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile filter dialog */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40 md:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white pb-12 shadow-xl">
                <div className="flex items-center justify-between px-4 pt-5">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md p-2 text-gray-400"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="px-4 pt-6 pb-2">
                  {/* Property Type */}
                  <Disclosure as="div" className="py-6 border-t border-gray-200">
                    {({ open }) => (
                      <>
                        <h3 className="flow-root">
                          <Disclosure.Button className="flex w-full items-center justify-between py-2 text-sm text-gray-400 hover:text-gray-500">
                            <span className="font-medium text-gray-900">Property Type</span>
                            <span className="ml-6 flex items-center">
                              <ChevronDownIcon
                                className={`${open ? '-rotate-180' : 'rotate-0'} h-5 w-5 transform`}
                                aria-hidden="true"
                              />
                            </span>
                          </Disclosure.Button>
                        </h3>
                        <Disclosure.Panel className="pt-2">
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <input
                                id="filter-mobile-property-all"
                                name="property-type"
                                type="radio"
                                checked={filters.propertyType === 'all'}
                                onChange={() => handlePropertyTypeChange('all')}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <label
                                htmlFor="filter-mobile-property-all"
                                className="ml-3 text-sm text-gray-700"
                              >
                                All Properties
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="filter-mobile-property-land"
                                name="property-type"
                                type="radio"
                                checked={filters.propertyType === 'land'}
                                onChange={() => handlePropertyTypeChange('land')}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <label
                                htmlFor="filter-mobile-property-land"
                                className="ml-3 text-sm text-gray-700"
                              >
                                Land Only
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="filter-mobile-property-house"
                                name="property-type"
                                type="radio"
                                checked={filters.propertyType === 'house'}
                                onChange={() => handlePropertyTypeChange('house')}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <label
                                htmlFor="filter-mobile-property-house"
                                className="ml-3 text-sm text-gray-700"
                              >
                                Houses
                              </label>
                            </div>
                          </div>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>

                  {/* Price Range */}
                  <Disclosure as="div" className="py-6 border-t border-gray-200">
                    {({ open }) => (
                      <>
                        <h3 className="flow-root">
                          <Disclosure.Button className="flex w-full items-center justify-between py-2 text-sm text-gray-400 hover:text-gray-500">
                            <span className="font-medium text-gray-900">Price Range</span>
                            <span className="ml-6 flex items-center">
                              <ChevronDownIcon
                                className={`${open ? '-rotate-180' : 'rotate-0'} h-5 w-5 transform`}
                                aria-hidden="true"
                              />
                            </span>
                          </Disclosure.Button>
                        </h3>
                        <Disclosure.Panel className="pt-2">
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="min-price-mobile" className="block text-sm font-medium text-gray-700">
                                Minimum Price ($)
                              </label>
                              <input
                                type="number"
                                id="min-price-mobile"
                                value={filters.priceRange[0]}
                                onChange={(e) => handlePriceChange([parseInt(e.target.value), filters.priceRange[1]])}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                              />
                            </div>
                            <div>
                              <label htmlFor="max-price-mobile" className="block text-sm font-medium text-gray-700">
                                Maximum Price ($)
                              </label>
                              <input
                                type="number"
                                id="max-price-mobile"
                                value={filters.priceRange[1]}
                                onChange={(e) => handlePriceChange([filters.priceRange[0], parseInt(e.target.value)])}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                              />
                            </div>
                          </div>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>

                  {/* Location */}
                  <Disclosure as="div" className="py-6 border-t border-gray-200">
                    {({ open }) => (
                      <>
                        <h3 className="flow-root">
                          <Disclosure.Button className="flex w-full items-center justify-between py-2 text-sm text-gray-400 hover:text-gray-500">
                            <span className="font-medium text-gray-900">Location</span>
                            <span className="ml-6 flex items-center">
                              <ChevronDownIcon
                                className={`${open ? '-rotate-180' : 'rotate-0'} h-5 w-5 transform`}
                                aria-hidden="true"
                              />
                            </span>
                          </Disclosure.Button>
                        </h3>
                        <Disclosure.Panel className="pt-2">
                          <div className="space-y-4">
                            {locations.map((location) => (
                              <div key={location} className="flex items-center">
                                <input
                                  id={`filter-mobile-location-${location.toLowerCase().replace(/\s+/g, '-')}`}
                                  name="location"
                                  type="radio"
                                  checked={
                                    (location === "All Locations" && filters.location === "all") || 
                                    filters.location === location
                                  }
                                  onChange={() => handleLocationChange(location)}
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label
                                  htmlFor={`filter-mobile-location-${location.toLowerCase().replace(/\s+/g, '-')}`}
                                  className="ml-3 text-sm text-gray-700"
                                >
                                  {location}
                                </label>
                              </div>
                            ))}
                          </div>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>

                  {/* Bedrooms (only for houses) */}
                  {filters.propertyType !== 'land' && (
                    <Disclosure as="div" className="py-6 border-t border-gray-200">
                      {({ open }) => (
                        <>
                          <h3 className="flow-root">
                            <Disclosure.Button className="flex w-full items-center justify-between py-2 text-sm text-gray-400 hover:text-gray-500">
                              <span className="font-medium text-gray-900">Bedrooms</span>
                              <span className="ml-6 flex items-center">
                                <ChevronDownIcon
                                  className={`${open ? '-rotate-180' : 'rotate-0'} h-5 w-5 transform`}
                                  aria-hidden="true"
                                />
                              </span>
                            </Disclosure.Button>
                          </h3>
                          <Disclosure.Panel className="pt-2">
                            <div className="space-y-4">
                              <div className="flex items-center">
                                <input
                                  id="filter-mobile-bedrooms-any"
                                  name="bedrooms"
                                  type="radio"
                                  checked={filters.bedrooms === 'any'}
                                  onChange={() => handleBedroomsChange('any')}
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label
                                  htmlFor="filter-mobile-bedrooms-any"
                                  className="ml-3 text-sm text-gray-700"
                                >
                                  Any
                                </label>
                              </div>
                              {[1, 2, 3, 4, 5].map((num) => (
                                <div key={num} className="flex items-center">
                                  <input
                                    id={`filter-mobile-bedrooms-${num}`}
                                    name="bedrooms"
                                    type="radio"
                                    checked={filters.bedrooms === num}
                                    onChange={() => handleBedroomsChange(num)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <label
                                    htmlFor={`filter-mobile-bedrooms-${num}`}
                                    className="ml-3 text-sm text-gray-700"
                                  >
                                    {num}+ bedrooms
                                  </label>
                                </div>
                              ))}
                            </div>
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  )}

                  {/* Bathrooms (only for houses) */}
                  {filters.propertyType !== 'land' && (
                    <Disclosure as="div" className="py-6 border-t border-gray-200">
                      {({ open }) => (
                        <>
                          <h3 className="flow-root">
                            <Disclosure.Button className="flex w-full items-center justify-between py-2 text-sm text-gray-400 hover:text-gray-500">
                              <span className="font-medium text-gray-900">Bathrooms</span>
                              <span className="ml-6 flex items-center">
                                <ChevronDownIcon
                                  className={`${open ? '-rotate-180' : 'rotate-0'} h-5 w-5 transform`}
                                  aria-hidden="true"
                                />
                              </span>
                            </Disclosure.Button>
                          </h3>
                          <Disclosure.Panel className="pt-2">
                            <div className="space-y-4">
                              <div className="flex items-center">
                                <input
                                  id="filter-mobile-bathrooms-any"
                                  name="bathrooms"
                                  type="radio"
                                  checked={filters.bathrooms === 'any'}
                                  onChange={() => handleBathroomsChange('any')}
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label
                                  htmlFor="filter-mobile-bathrooms-any"
                                  className="ml-3 text-sm text-gray-700"
                                >
                                  Any
                                </label>
                              </div>
                              {[1, 2, 3, 4, 5].map((num) => (
                                <div key={num} className="flex items-center">
                                  <input
                                    id={`filter-mobile-bathrooms-${num}`}
                                    name="bathrooms"
                                    type="radio"
                                    checked={filters.bathrooms === num}
                                    onChange={() => handleBathroomsChange(num)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <label
                                    htmlFor={`filter-mobile-bathrooms-${num}`}
                                    className="ml-3 text-sm text-gray-700"
                                  >
                                    {num}+ bathrooms
                                  </label>
                                </div>
                              ))}
                            </div>
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  )}
                </div>

                {/* Apply button */}
                <div className="px-4 py-4 border-t border-gray-200">
                  <button
                    type="button"
                    className="w-full bg-primary text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-primary-dark"
                    onClick={applyFilters}
                  >
                    Apply Filters
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default PropertyFilters;