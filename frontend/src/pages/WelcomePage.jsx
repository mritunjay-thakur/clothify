import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import HeaderNonAuthUser from "../components/HeaderNonAuthUser";
import GlowButton from "../components/GlowStartButton";
import Balatro from "../../jsrepo/Balatro/Balatro";

const WelcomePage = () => {
  const [isLoaded, setIsLoaded] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <Balatro
          spinRotation={-0.0}
          spinSpeed={2.0}
          offset={[0.1, -0.05]}
          color1="#6a0dad"
          color2="#7f00ff"
          color3="#000000"
          contrast={4.0}
          lighting={0.6}
          spinAmount={0.35}
          pixelFilter={2000}
          spinEase={0.8}
          isRotate={true}
          mouseInteraction={true}
        />
      </div>

      <HeaderNonAuthUser isAuthenticated={!!isAuthenticated} />

      <div className="relative z-20">
        <main className="flex flex-col items-center justify-center min-h-screen px-6 md:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-6 leading-[1.2] pb-4">
                Clothify.Ai
              </h1>

              <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                <div className="text-2xl md:text-4xl lg:text-5xl mb-4 leading-relaxed text-white font-bold">
                  Dress Like a Snack, Feel Like a Whole Meal!
                </div>
              </div>

              <p className="text-lg md:text-xl font-thin mt-5 text-white max-w-3xl mx-auto leading-relaxed">
                Your ultimate AI fashion assistant, delivering personalized
                style recommendations and expertly curated outfit suggestions
                tailored for every occasion.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-12">
              <GlowButton onClick={() => navigate("/clothify")} />
            </div>

            <p className="text-white text-xl mt-4 flex items-center justify-center">
              Made with ❤️ by Mritunjay Thakur
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WelcomePage;
