import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileX, Home, ArrowLeft } from "lucide-react";
import SEO from '../components/SEO';


const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-all duration-700 ease-in-out">
      <SEO title="404 Not Found | Kidolio" description="Sorry, the page you are looking for does not exist on Kidolio." />
      {/* Enhanced animated background shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-400 opacity-20 rounded-full blur-3xl animate-float-slow z-0" />
      <div className="absolute -bottom-40 -right-40 w-[32rem] h-[32rem] bg-gradient-to-tr from-purple-400 to-blue-400 opacity-20 rounded-full blur-3xl animate-float-slower z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-radial from-blue-200/40 via-purple-200/30 to-transparent rounded-full blur-2xl z-0" />
      {/* Split layout, now fully responsive and 404 graphic moved up */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center w-full max-w-4xl h-auto md:h-[80vh] bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden border-2 border-blue-100/30 dark:border-gray-800/40 mx-2 my-6 md:my-0">
        {/* Left: Mascot & 404 */}
        <div className="flex flex-col items-center justify-start w-full md:w-1/2 h-full pt-8 pb-4 px-4 sm:p-8 gap-4 bg-gradient-to-br from-blue-100/60 to-purple-100/60 dark:from-gray-800/60 dark:to-gray-900/60 relative min-h-[220px] md:min-h-0">
          {/* 404 graphic and number moved up */}
          <div className="relative mb-2 mt-2 sm:mt-6 md:mt-8">
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse-slow border-8 border-white/40 dark:border-gray-900/40">
              <FileX className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white drop-shadow-2xl animate-bounceIn" />
            </div>
            <span className="absolute -top-3 -right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 dark:bg-gray-900/80 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <span className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full block" />
            </span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_8px_40px_rgba(99,102,241,0.5)] tracking-tight animate-fadeInUp font-mono">
            404
          </h1>
        </div>
        {/* Right: Speech bubble & actions */}
        <div className="flex flex-col items-center justify-center w-full md:w-1/2 h-full p-4 sm:p-8 gap-6">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl px-4 sm:px-8 py-4 sm:py-6 max-w-md w-full text-center border-2 border-blue-100 dark:border-gray-700 animate-fadeInUp transition-all duration-500">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 animate-fadeInUp">
              Oops! Page Not Found
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-2 font-light animate-fadeInUp">
              Sorry, the page{" "}
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                {location.pathname}
              </span>{" "}
              does not exist.
              <br />
              It may have been moved or deleted.
            </p>
            <div className="mt-4 text-sm sm:text-base text-purple-500 dark:text-purple-300 animate-fadeInUp">
              But don’t worry, you can always get back on track!
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center animate-fadeInUp">
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 sm:px-8 py-3 rounded-2xl shadow-xl hover:scale-110 transition-all duration-200 flex items-center gap-2 w-full sm:w-auto text-base sm:text-lg animate-bounceIn"
            >
              <Link to="/">
                <Home className="w-5 h-5 sm:w-6 sm:h-6" />
                Home
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="border-blue-400 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl px-6 sm:px-8 py-3 font-semibold shadow transition-all duration-200 hover:scale-110 flex items-center gap-2 w-full sm:w-auto text-base sm:text-lg animate-bounceIn"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              Go Back
            </Button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default NotFound;
