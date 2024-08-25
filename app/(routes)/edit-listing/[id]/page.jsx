"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Formik } from "formik";
import { toast } from "sonner";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import FileUpload from "../_components/FileUpload";
import Header from "@/app/_components/Header";

const EditListing = () => {
  const { id } = useParams();
  const { user } = useUser();
  const router = useRouter();
  const [loader, setLoader] = useState(false);
  const [images, setImages] = useState([]);
  const [houselisting, setHouseListing] = useState([]);
  const [dbImages, setDbImages] = useState([]);

  useEffect(() => {
    user && verifyUserRecord();
  }, [user, id]);

  const verifyUserRecord = async () => {
    const { data, error } = await supabase
      // .from("houselistings")
      //   .select("*")
      //   .eq("createdBy", user?.primaryEmailAddress.emailAddress)
      //   .eq("id", id);
      .from("houselistings")
      .select("*, houseListingImages(url, listing_id, id)")
      .eq("createdBy", user?.primaryEmailAddress.emailAddress)
      .eq("id", id);

    if (data) {
      setHouseListing(data[0]);
      setDbImages(data[0].houseListingImages);
    }

    if (data?.length <= 0) {
      router.replace("/");
    }
    if (error) {
      router.replace("/");
    }
  };

  const uploadImage = async () => {
    for (const image of images) {
      const file = image.file;
      const filename = Date.now().toString();
      const fileExt = filename.split(".").pop();

      const { data, error } = await supabase.storage
        .from("houseListingImages")
        .upload(`${filename}`, file, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (error) {
        setLoader(false);
        toast("Error while uploading images");
      } else {
        //Generate image url and save to database
        const imageUrl = process.env.NEXT_PUBLIC_IMAGE_URL + filename;
        const { data, error } = await supabase
          .from("houseListingImages")
          .insert({ url: imageUrl, listing_id: id });

        if (error) {
          setLoader(false);
          toast("Error while uploading images.");
        }
      }
      toast("Uploaded details successfully");
      setLoader(false);
    }
  };

  const onSubmitHandler = async (formValues, { setSubmitting }) => {
    setLoader(true);
    const title = formValues.title;
    const type = formValues.type;
    const propertyType = formValues.propertyType;
    const description = formValues.description;
    const price = formValues.price;
    const bedrooms = formValues.bedrooms;
    const bathrooms = formValues.bathrooms;
    const parking = formValues.parking;
    const houseSize = formValues.houseSize;
    const areaSize = formValues.areaSize;
    const username = formValues.username;

    //Save info to Supabase
    const { data, error } = await supabase
      .from("houselistings")
      .update({
        propertyType: propertyType,
        bedroom: bedrooms,
        parking: parking,
        houseSize: houseSize,
        areaSize: areaSize,
        price: price,
        description: description,
        title: title,
        type: type,
        bathroom: bathrooms,
      })
      .eq("id", id)
      .select();

    if (data) {
      uploadImage();
    }
    if (error) {
      setLoader(false);
      console.log(error);
    }
  };

  return (
    <>
      <Header />
      <div className="w-full px-10 py-6 pt-[7.5rem]">
        <h1 className="text-3xl font-bold text-primary mt-1 text-center uppercase underline">
          Edit Listing
        </h1>

        <div className="m-8 md:m-16 lg:m-16 xl:m-16 shadow-md border p-10 rounded-sm">
          <Formik
            initialValues={{
              title: "",
              type: "",
              propertyType: "",
              description: "",
              price: "",
              bedrooms: "",
              bathrooms: "",
              parking: "",
              houseSize: "",
              areaSize: "",
              profileImage: user?.imageUrl,
              username: user?.fullName,
            }}
            validate={(values) => {
              const errors = {};
              if (!values.title) {
                errors.title = "Title is required";
              }
              if (!values.type) {
                errors.type = "Rent or Sell is required";
              }
              if (!values.propertyType) {
                errors.propertyType = "Property Type is required";
              }
              if (!values.description) {
                errors.description = "Description is required";
              }
              if (!values.price) {
                errors.price = "Price is required";
              }
              if (!values.bedrooms) {
                errors.bedrooms = "Bedrooms is required";
              }
              if (!values.bathrooms) {
                errors.bathrooms = "Bathrooms is required";
              }
              if (!values.parking) {
                errors.parking = "Parking is required";
              }
              if (!values.houseSize) {
                errors.houseSize = "House Size is required";
              }
              if (!values.areaSize) {
                errors.areaSize = "Area Size is required";
              }

              // if (Object.keys(errors).length >= 1) {
              //   toast("Fill all required fields");
              // }
              return errors;
            }}
            onSubmit={(values, { setSubmitting }) => {
              onSubmitHandler(values, { setSubmitting });
              setSubmitting(true);
            }}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
            }) => (
              <form onSubmit={handleSubmit}>
                <div className="">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="">
                      <h2 className="text-md font-semibold">Rent or Sell</h2>
                      <RadioGroup
                        onValueChange={(v) => (values.type = v)}
                        className="my-3"
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <RadioGroupItem value="For Sell" id="for-sell" />
                          <Label htmlFor="for-sell">For Sell</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="For Rent" id="for-rent" />
                          <Label htmlFor="for-rent">For Rent</Label>
                        </div>
                      </RadioGroup>
                      <small className="text-red-800">
                        {errors.type && touched.type && errors.type}
                      </small>
                    </div>

                    <div>
                      <h2 className="text-md mb-3 font-semibold">
                        Property Type
                      </h2>
                      <Select
                        name="propertyType"
                        onValueChange={(e) => (values.propertyType = e)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Property Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Completed House">
                            Completed House
                          </SelectItem>
                          <SelectItem value="Uncompleted House">
                            Uncompleted House
                          </SelectItem>
                          <SelectItem value="Family House">
                            Family House
                          </SelectItem>
                          <SelectItem value="Compound House">
                            Compound House
                          </SelectItem>
                          <SelectItem value="Land">Land</SelectItem>
                          <SelectItem value="Store">Store</SelectItem>
                        </SelectContent>
                      </Select>
                      <small className="text-red-800">
                        {errors.propertyType &&
                          touched.propertyType &&
                          errors.propertyType}
                      </small>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mt-5 gap-4">
                    <div className="flex gap-2 flex-col">
                      <h2 className="text-gray-900 font-semibold">Title</h2>
                      <Input
                        placeholder="Title"
                        name="title"
                        type="text"
                        onChange={handleChange}
                        value={values.title}
                      />
                      <small className="text-red-800">
                        {errors.title && touched.title && errors.title}
                      </small>
                    </div>
                    <div className="flex gap-2 flex-col">
                      <h2 className="text-gray-900 font-semibold">Bed Rooms</h2>
                      <Input
                        placeholder="Number of Bedrooms"
                        name="bedrooms"
                        type="number"
                        onChange={handleChange}
                        value={values.bedrooms}
                      />
                      <small className="text-red-800">
                        {errors.bedrooms && touched.bedrooms && errors.bedrooms}
                      </small>
                    </div>
                    <div className="flex gap-2 flex-col">
                      <h2 className="text-gray-900 font-semibold">Bathrooms</h2>
                      <Input
                        placeholder="Number of Bathrooms"
                        name="bathrooms"
                        type="number"
                        onChange={handleChange}
                        value={values.bathrooms}
                      />
                      <small className="text-red-800">
                        {errors.bathrooms &&
                          touched.bathrooms &&
                          errors.bathrooms}
                      </small>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mt-5 gap-4">
                    <div className="flex gap-2 flex-col">
                      <h2 className="text-gray-900 font-semibold">Parking</h2>
                      <Input
                        placeholder="Parking Places"
                        name="parking"
                        type="number"
                        onChange={handleChange}
                        value={values.parking}
                      />
                      <small className="text-red-800">
                        {errors.parking && touched.parking && errors.parking}
                      </small>
                    </div>
                    <div className="flex gap-2 flex-col">
                      <h2 className="text-gray-900 font-semibold">
                        House Size
                      </h2>
                      <Input
                        placeholder="Sq.ft"
                        name="houseSize"
                        type="text"
                        onChange={handleChange}
                        value={values.houseSize}
                      />
                      <small className="text-red-800">
                        {errors.houseSize &&
                          touched.houseSize &&
                          errors.houseSize}
                      </small>
                    </div>

                    <div className="flex gap-2 flex-col">
                      <h2 className="text-gray-900 font-semibold">
                        Area (Sq.ft){" "}
                      </h2>
                      <Input
                        placeholder="Ex.1900 Sq.ft"
                        name="areaSize"
                        type="text"
                        onChange={handleChange}
                        value={values.areaSize}
                      />
                      <small className="text-red-800">
                        {errors.areaSize && touched.areaSize && errors.areaSize}
                      </small>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mt-5 gap-4">
                    <div className="flex gap-2 flex-col">
                      <h2 className="text-gray-900 font-semibold">
                        Price (GHS)
                      </h2>
                      <Input
                        placeholder="40000"
                        name="price"
                        type="number"
                        onChange={handleChange}
                        value={values.price}
                      />
                      <small className="text-red-800">
                        {errors.price && touched.price && errors.price}
                      </small>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h2 className="text-gray-900 font-semibold mb-4">
                      Description
                    </h2>
                    <Textarea
                      placeholder="Description of the property"
                      name="description"
                      onChange={handleChange}
                      value={values.description}
                    />
                    <small className="text-red-800">
                      {errors.description &&
                        touched.description &&
                        errors.description}
                    </small>
                  </div>

                  <div className="mt-5">
                    <h2 className="text-gray-900 font-semibold mb-4">
                      Upload Files/Images
                    </h2>
                    <FileUpload
                      dbImages={dbImages}
                      setImages={(value) => setImages(value)}
                    />
                  </div>

                  <div className="flex items-center justify-center md:justify-end lg:justify-end gap-6 mt-5">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary text-white py-2 px-4 rounded-md shadow-md"
                    >
                      {loader ? (
                        <Loader className="animate-spin" />
                      ) : (
                        "Save and Published"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default EditListing;
