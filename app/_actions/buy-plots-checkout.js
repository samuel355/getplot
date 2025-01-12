export const BuyPlotCheckout = async (plots, plotData, setVerifyLoading) => {
  setVerifyLoading(true);
  console.log("plots:", plots);
  console.log("plotData", plotData);
  setVerifyLoading(false);
};
