import { Eye, Heart, Star } from "lucide-react";

const CardHoverIcons = () => {
  return (
    <div className="absolute hidden -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 group-hover:block gap-x-3">
      <div className="text-white flex items-center justify-center gap-x-2">
        <div className="rounded-full bg-primary hover:bg-secondary">
          <Heart className="w-5 h-5 p-1" />
        </div>
        <div className="rounded-full bg-primary hover:bg-secondary">
          <Eye className="w-5 h-5 p-1" />
        </div>
        <div className="rounded-full bg-primary hover:bg-secondary">
          <Star className="w-5 h-5 p-1" />
        </div>
      </div>
    </div>
  );
};

export default CardHoverIcons;
