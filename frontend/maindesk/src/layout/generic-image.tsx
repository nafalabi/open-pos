import { ImageOff } from "lucide-react";
import { memo, useEffect, useState } from "react";

type GenericImageProps = {
  src?: string;
  fallbackSrc?: string;
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
};

const GenericImage = memo(
  ({ src, fallbackSrc, containerProps }: GenericImageProps) => {
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
        {hideImage && !fallbackSrc && (
          <ImageOff className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]" />
        )}
        {hideImage && fallbackSrc && (
          <img
            src={fallbackSrc}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        )}
        <img
          key={src}
          src={src}
          loading="lazy"
          style={{
            display: hideImage ? "none" : "block",
          }}
          className="w-full h-full object-cover"
          onError={() => {
            setShowFallback(true);
          }}
        />
      </div>
    );
  }
);

export default GenericImage;
