import Link from 'next/link';

export default function Home() {
  return (
      <div className="bg-gray-900 min-h-screen flex flex-col lg:flex-row items-center">
    {/* Left content */}
    <div className="z-10 lg:w-1/2 w-full text-center lg:text-left p-6 sm:p-8 md:p-12 lg:p-20 flex flex-col justify-center">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mt-8 lg:mt-0">
        Welcome to the <br />
        <span className="text-purple-500">Visitor Reservation App</span>
      </h1>

      <p className="mt-4 sm:mt-6 text-gray-300 text-base sm:text-lg md:text-xl max-w-md mx-auto lg:mx-0">
        Streamline your visitor management process with ease. Book a new visit for your guests quickly and efficiently.
      </p>

      <div className="mt-6 sm:mt-8">
        <Link
          href="/login"
          className="inline-block px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          Make a Reservation
        </Link>
      </div>
    </div>

    {/* Right image */}
    <div className="lg:w-1/2 w-full h-64 sm:h-80 md:h-96 lg:h-screen">
      <img
        src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80"
        alt="People working in an office"
        className="w-full h-full object-cover rounded-t-lg lg:rounded-none"
      />
    </div>
  </div>

  );
}
