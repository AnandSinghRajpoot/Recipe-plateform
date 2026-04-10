import React from "react";
import Lottie from "lottie-react";

/**
 * A reusable Lottie player that can load animations from a URL or a direct JSON object.
 * Standard URLs can be found on LottieFiles.com
 */
const LottiePlayer = ({ 
  animationUrl, 
  animationData, 
  loop = true, 
  autoplay = true,
  className = "w-64 h-64 mx-auto"
}) => {
  const [data, setData] = React.useState(animationData);

  React.useEffect(() => {
    if (animationUrl && !animationData) {
      fetch(animationUrl)
        .then((res) => res.json())
        .then((json) => setData(json))
        .catch((err) => console.error("Error loading Lottie animation:", err));
    }
  }, [animationUrl, animationData]);

  if (!data) return <div className={`${className} bg-surface-container-high animate-pulse rounded-full`} />;

  return (
    <div className={className}>
      <Lottie 
        animationData={data} 
        loop={loop} 
        autoplay={autoplay} 
      />
    </div>
  );
};

export default LottiePlayer;
