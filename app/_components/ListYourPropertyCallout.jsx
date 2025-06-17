export default function ListYourPropertyCallout() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6 flex items-center justify-between">
      <div>
        <h2 className="text-sm md:text-lg font-semibold text-primary">Want to list your property?</h2>
        <p className="text-primary text-xs md:text-md">
          Contact us with your details and we'll help you get your property listed on our marketplace.
        </p>
      </div>
      <a
        href="/contact"
        className="ml-4 px-4 py-2 text-center text-xs md:text-md bg-primary text-white rounded hover:bg-primary/90 transition"
      >
        Contact Us
      </a>
    </div>
  );
} 