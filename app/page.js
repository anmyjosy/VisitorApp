import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-gray-900 min-h-screen flex flex-col lg:flex-row items-center lg:items-center px-6 lg:px-20 py-12 lg:py-24">
      
      {/* Left side content */}
      <div className="z-10 lg:w-7/12 max-w-3xl text-center lg:text-left">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
          Welcome to the
          <br />
          <span className="text-purple-500">Visitor Reservation App</span>
        </h1>

        <p className="mt-6 text-gray-300 text-base sm:text-lg md:text-xl lg:text-xl max-w-xl mx-auto lg:mx-0">
          Streamline your visitor management process with ease. Book a new visit for your guests quickly and efficiently.
        </p>
        <div className="mt-8">
          <Link
            href="/login"
            className="inline-block px-8 py-4 text-base sm:text-lg font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-lg"
          >
            Make a Reservation
          </Link>
        </div>
      </div>
      
      {/* Right side image */}
      <div className="lg:w-5/12 w-full mt-10 lg:mt-0 lg:h-[500px] rounded-none overflow-hidden shadow-lg">
        <img
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80"
          alt="People working in an office"
          className="w-full h-full object-cover"
        />
      </div>

    </div>
  );
}
