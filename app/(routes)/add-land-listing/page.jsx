"use client";
import FileUpload from "@/app/_components/FileUpload";
import GoogleAddressSearch from "@/app/_components/GoogleAddressSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@clerk/nextjs";
import { Formik } from "formik";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import Header from "@/app/_components/Header";

const page = () => {
  const [selectedAddress, setSelectedAddress] = useState();
  const [coordinates, setCoordinates] = useState();
  const [loader, setLoader] = useState(false);
  const [images, setImages] = useState([]);
  const [dbImages, setDbImages] = useState([]);
  const [pickedAddress, setPickedAddress] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  // useEffect(() => {
  //   if (!user) {
  //     window.location.href = "/sign-in";
  //   }
  // }, [user]);

  //Upload Image to Supabase
  const uploadImage = async (id) => {
    for (const image of images) {
      const file = image.file;
      const filename = Date.now().toString();
      const fileExt = filename.split(".").pop();

      const { data, error } = await supabase.storage
        .from("landListingImages")
        .upload(`${filename}`, file, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (error) {
        setLoader(false);
        toast("Error while uploading images");
        console.log(error);
      } else {
        //Generate image url and save to database
        const imageUrl = process.env.NEXT_PUBLIC_IMAGE_LAND_URL + filename;
        const { data, error } = await supabase
          .from("landListingImages")
          .insert({ url: imageUrl, listing_id: id });

        if (error) {
          console.log(error);
          setLoader(false);
          toast("Error while uploading images.");
        }

        if (data) {
          toast("Uploaded details successfully");
          router.replace("/view-land-listing/" + id);
          setLoader(false);
        }
      }
    }
  };

  //Submit Details to Supabae
  const onSubmitHandler = async (formValues, { setSubmitting }) => {
    setLoader(true);
    if (images.length <= 0) {
      setLoader(false);
      return toast("Add at least 2 images");
    }
    if (selectedAddress === null) {
      setLoader(false);
      return toast("Add the address of the property");
    }
    const title = formValues.title;
    const propertyType = formValues.propertyType;
    const description = formValues.description;
    const price = formValues.price;
    const phone = formValues.phone;
    const areaSize = formValues.areaSize;

    //Save info to Supabase
    const { data, error } = await supabase
      .from("landlistings")
      .insert([
        {
          propertyType: propertyType,
          phone: phone,
          areaSize: areaSize,
          price: price,
          description: description,
          title: title,

          //
          address: selectedAddress.label,
          coordinates: coordinates,
          createdBy: user?.primaryEmailAddress.emailAddress,
          username: user?.username,
          fullName: user?.fullName,
        },
      ])
      .select();

    if (data) {
      const id = data[0].id;
      uploadImage(id);
    }
    if (error) {
      setLoader(false);
      console.log(error);
    }
  };

  return (
    <>
      <Header />
      <div className="w-full px-12 pt-[7.5rem]">
        <h2 className="font-bold text-2xl text-center mb-5">
          Add Land Listing
        </h2>
        <div className="shadow-md border rounded-sm">
          <div className="py-8 mx-10">
            <div className="flex items-center justify-center flex-col gap-5">
              <div className="p-5 rounded-lg border shadow-sm flex flex-col gap-5 w-full">
                <h2 className="text-g">
                  Search and Enter Address (location) of the property
                </h2>
                <GoogleAddressSearch
                  selectedAddress={(value) => {
                    setSelectedAddress(value);
                    setPickedAddress(true);
                  }}
                  setCoordinates={(value) => setCoordinates(value)}
                />
              </div>
            </div>
          </div>

          {pickedAddress && (
            <Formik
              initialValues={{
                title: "",
                propertyType: "",
                description: "",
                price: "",
                phone: "",
                areaSize: "",
              }}
              validate={(values) => {
                const errors = {};
                if (!values.title) {
                  errors.title = "Title is required";
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
                if (!values.phone) {
                  errors.phone = "Phone Number is required";
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
                  <div className="px-10 pt-4">
                    <div className="mb-5 mt-2">
                      <h2 className="text-gray-900 font-semibold mb-4">
                        Upload Files/Images
                      </h2>
                      <FileUpload
                        dbImages={dbImages}
                        setImages={(value) => setImages(value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="w-full">
                        <h2 className="text-md mb-3 font-semibold">
                          Land Nature
                        </h2>
                        <Select
                          className="w-full"
                          name="propertyType"
                          onValueChange={(e) => (values.propertyType = e)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Property Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Serviced Land">
                              Serviced Land
                            </SelectItem>
                            <SelectItem value="Unserviced Land">
                              Unserviced Land
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <small className="text-red-800">
                          {errors.propertyType &&
                            touched.propertyType &&
                            errors.propertyType}
                        </small>
                      </div>

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
                        <h2 className="text-gray-900 font-semibold">Contact</h2>
                        <Input
                          placeholder="Phone number"
                          name="phone"
                          type="number"
                          onChange={handleChange}
                          value={values.phone}
                        />
                        <small className="text-red-800">
                          {errors.phone && touched.phone && errors.phone}
                        </small>
                      </div>

                      <div className="flex gap-2 flex-col">
                        <h2 className="text-gray-900 font-semibold">
                          Size (Acre){" "}
                        </h2>
                        <Input
                          placeholder="Land Size"
                          name="areaSize"
                          type="number"
                          onChange={handleChange}
                          value={values.areaSize}
                        />
                        <small className="text-red-800">
                          {errors.areaSize &&
                            touched.areaSize &&
                            errors.areaSize}
                        </small>
                      </div>

                      <div className="flex gap-2 flex-col">
                        <h2 className="text-gray-900 font-semibold">
                          Price (GHS)
                        </h2>
                        <Input
                          placeholder="12345"
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

                    <div className="flex items-center justify-center md:justify-end lg:justify-end gap-6 mt-5 pb-6">
                      <button
                        type="submit"
                        className="bg-primary text-white py-2 px-4 rounded-md shadow-md"
                      >
                        {loader ? (
                          <Loader className="animate-spin" />
                        ) : (
                          "Save and Publish"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </>
  );
};

export default page;
