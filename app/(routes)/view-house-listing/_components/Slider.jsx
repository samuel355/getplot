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
    <div className="px-10">
      {imageLists?.length > 0 ? (
        <Carousel className="w-full">
          <CarouselContent>
            {imageLists?.map((image, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <CardContent className="flex items-center justify-center p-2 mt-4">
                    <Image
                      className="rounded-xl object-cover md:h-[400px] xl:h-[400px] lg:h-[400px] h-[340px] w-full"
                      src={image.url}
                      width={700}
                      height={300}
                      alt="Property Image"
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
