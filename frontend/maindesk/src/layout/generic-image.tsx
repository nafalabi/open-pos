import { ImageOff } from "lucide-react";
import { memo, useEffect, useState } from "react";

type GenericImageProps = {
  src?: string;
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
};

const GenericImage = memo(({ src, containerProps }: GenericImageProps) => {
  const [showFallback, setShowFallback] = useState(false);
  const hideImage = showFallback || !src;

  useEffect(() => {
    setShowFallback(false);
  }, [src]);

  return (
    <div
      {...containerProps}
      className={`rounded-md relative overflow-hidden ${containerProps?.className ?? ""}`}
    >
      {hideImage && (
        <ImageOff className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]" />
      )}
      <img
        key={src}
        src={src}
        loading="lazy"
        style={{
          opacity: hideImage ? 0 : 1,
        }}
        className="w-full h-full object-cover z-20"
        onError={() => {
          setShowFallback(true);
        }}
      />
    </div>
  );
});

export default GenericImage;
