const cardLabels = ({ purpose}) => {
  return (
    <div className="absolute top-2 left-2 flex-align-center gap-x-2">
      <span className="py-[3px] px-3 text-sm rounded-full capitalize text-white bg-primary">
      {purpose}
      </span>
    </div>
  );
};

export default cardLabels;
