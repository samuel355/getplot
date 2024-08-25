import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

const Slider = ({ imageLists }) => {
  return (
    <div>
      {imageLists?.length > 0 ? (
        <Carousel className="w-full">
          <CarouselContent>
            {imageLists?.map((image, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <CardContent className="flex items-center justify-center p-2 mt-4">
                    <Image
                      className="rounded-xl object-cover h-[400px] w-full"
                      src={image?.url}
                      width={700}
                      height={300}
                      alt="Land Image"
                    />
                  </CardContent>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      ) : (
        <div className="w-full h-[200px] bg-slate-200 animate-pulse rounded-md"></div>
      )}
    </div>
  );
};

export default Slider;
