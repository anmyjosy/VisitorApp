import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-transparent absolute w-full z-20">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
            <div className="flex items-center justify-between h-20"> {/* increased h-16 → h-20 */}
            <div className="flex-shrink-0">
                <Link href="/" className="text-xl font-bold text-white"> {/* bigger font */}
                VisitorApp
                </Link>
            </div>
            <div className="hidden md:block">
                <div className="ml-12 flex items-baseline space-x-6"> {/* increased spacing */}
                <Link href="/" className="text-gray-300 hover:bg-gray-700/50 hover:text-white px-4 py-3 rounded-md text-lg font-medium">Home</Link>
                <Link href="/adminlogin" className="text-gray-300 hover:bg-gray-700/50 hover:text-white px-4 py-3 rounded-md text-lg font-medium">Manage Reservations</Link>
                </div>
            </div>
            </div>
        </div>
        </nav>
  );
};

export default Navbar;