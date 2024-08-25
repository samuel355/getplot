"use client";
import { Button } from "@/components/ui/button";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@clerk/nextjs";
import { Bath, BedDouble, CarFront, Loader, MapPin, PencilLine, Ruler, ScanEye, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const UserListing = () => {
  const [userListing, setUserListing] = useState();
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const email = user?.primaryEmailAddress.emailAddress;

  useEffect(() => {
    getUserListing();
  }, [user]);

  const getUserListing = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("houselistings")
      .select("*, houseListingImages(url, listing_id, id)")
      .eq("createdBy", email)
      //.eq("active", true)
      .order("created_at", { ascending: false });

    if (data) {
      setLoading(false);
      setUserListing(data);
    }
    if (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const handleDeleteListing = (listingId) => {
    toast(`Item ID to be delete: \n ${listingId}`);
    console.log(`Item ID to be delete: \n ${listingId}`);
  };

  return (
    <div>
      <div>
        <h2 className="font-bold text-2xl text-primary ml-2">
          Manage your listing
        </h2>
        <div className="mt-4">
          {!loading &&
            (userListing?.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {userListing.map((item, index) => (
                  <div
                    key={index}
                    className="shadow-sm rounded p-2 hover:border hover:border-primary bg-white relative"
                  >
                    <h2
                      className={`${
                        item.active ? "text-primary" : "text-red-500"
                      } font-semibold text-sm absolute left-0 bg-white  p-2 rounded-md ml-3 m-1`}
                    >
                      {item.active ? "Published" : "In Draft"}
                    </h2>
                    <Link href={"/view-user-listing/" + item.id}>
                      <Image
                        className="object-cover h-[250px] rounded cursor-pointer"
                        src={item.houseListingImages[0]?.url ? item.houseListingImages[0]?.url : '/image-placeholder.png'}
                        width={800}
                        height={250}
                      />
                    </Link>
                    <div className="flex flex-col gap-2 mt-3">
                      <h2 className="font-bold text-xl text-primary">
                        GHS {item.price.toeString()}
                      </h2>
                      <h2 className="flex gap-2 items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4" /> {item.address}
                      </h2>
                    </div>
                    <div className="bg-slate-100 rounded-md p-2 text-gray-400 mt-3">
                      <div className="flex items-center justify-between text-sm mt-3 border-b pb-2">
                        <p className="flex items-center gap-1">
                          <BedDouble className="h-4 w-4" />{" "}
                          <span>Bedrooms</span>
                        </p>
                        <p className="">
                          <span>{item?.bedroom}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm py-2 border-b">
                        <p className="flex items-center gap-1">
                          <Bath className="h-4 w-4" /> <span>Bathrooms</span>
                        </p>
                        <p className="">
                          <span>{item?.bathroom}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm py-2 border-b">
                        <p className="flex items-center gap-1">
                          <Ruler className="h-4 w-4" /> <span>Area Size</span>
                        </p>
                        <p className="">
                          <span>{item?.areaSize} sqft.</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm py-2">
                        <p className="flex items-center gap-1">
                          <CarFront className="h-4 w-4" />{" "}
                          <span>Parking Area</span>
                        </p>
                        <p className="">
                          <span>{item?.parking} </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-center justify-end mt-2">
                      <Link href={"/edit-user-listing/" + item.id} className="">
                        <Button className="my-2 text-sm cursor-pointer">
                        <PencilLine className="w-4 h-4 mr-2" />  Edit
                        </Button>
                      </Link>
                      <Link href={"/view-house-listing/" + item.id} className="">
                        <Button className="my-2 text-sm cursor-pointer">
                          <ScanEye className="w-4 h-4 mr-2" /> View 
                        </Button>
                      </Link>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="text-red-600">
                          <Trash className="w-4 h-4 mr-2" />  Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Delete Listing ? </DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this Listing
                            </DialogDescription>
                          </DialogHeader>

                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="secondary">
                                Close
                              </Button>
                            </DialogClose>

                            <Button
                              onClick={() => handleDeleteListing(item.id)}
                              className="bg-red-700 text-white"
                              type="submit"
                            >
                              <Trash className="w-4 h-4 mr-2" />  Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center mt-14 border py-6">
                <h2 className="font-bold text-xl text-gray-400 text-center">
                  No Listing Found
                </h2>
                <p className="text-gray-400 text-center my-3">
                  You have not added any listing yet
                </p>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <Link
                    href={"/add-land-listing"}
                    className="text-white bg-primary text-lg py-2 px-6 rounded-lg mt-5  ml-16 md:ml-0 lg:ml-0 xl:ml-0"
                  >
                    Add Land Listing
                  </Link>
                  <Link
                    href={"/add-house-listing"}
                    className="text-white bg-primary text-lg py-2 px-6 rounded-lg mt-5 ml-16 md:ml-0 lg:ml-0 xl:ml-0"
                  >
                    Add House Listing
                  </Link>
                </div>
              </div>
            ))}
          {loading && (
            <div className="flex flex-col justify-center items-center">
              <Loader className="animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListing;
