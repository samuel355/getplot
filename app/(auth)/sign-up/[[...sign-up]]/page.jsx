import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <>
      <section className="bg-white border mx-10 mb-10">
        <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
          <section className="relative flex h-32 items-end lg:col-span-5 lg:h-full xl:col-span-6">
            <img
              alt=""
              src="hero.png"
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />

            <div className="hidden lg:relative lg:block lg:p-12">
              <a className="block text-white" href="#">
                <span className="sr-only">Home</span>
              </a>

              <div className="bg-primary/70 p-4">
                <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                  Welcome to <br /> Get One Plot
                </h2>

                <p className="mt-4 leading-relaxed text-white/90">
                  Discover your dream home with our real estate app! Browse
                  thousands of listings, connect with trusted agents, and find
                  the perfect property tailored to your needs. With intuitive
                  search filters and real-time updates, your next home is just a
                  tap away. Simplify your property search and embark on your
                  journey to homeownership today!
                </p>
              </div>
            </div>
          </section>

          <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
            <div className="max-w-xl lg:max-w-3xl">
              <div className="relative -mt-16 block lg:hidden mb-7">
                <a
                  className="inline-flex size-16 items-center justify-center rounded-full bg-white text-blue-600 sm:size-20"
                  href="#"
                >
                </a>

                <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
                  Welcome to <br /> Get One Plot
                </h1>

                <p className="mt-4 leading-relaxed text-gray-500">
                  Discover your dream home with our real estate app! Browse
                  thousands of listings, connect with trusted agents, and find
                  the perfect property tailored to your needs. With intuitive
                  search filters and real-time updates, your next home is just a
                  tap away. Simplify your property search and embark on your
                  journey to homeownership today!
                </p>
              </div>

              <SignUp path="/sign-up" />
            </div>
          </main>
        </div>
      </section>
    </>
  );
}
