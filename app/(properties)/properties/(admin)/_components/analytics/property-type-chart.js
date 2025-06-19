import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export function PropertyTypeChart({ data }) {
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: ["rgba(59, 130, 246, 0.5)", "rgba(34, 197, 94, 0.5)"],
        borderColor: ["rgb(59, 130, 246)", "rgb(34, 197, 94)"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Property Types Distribution",
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
