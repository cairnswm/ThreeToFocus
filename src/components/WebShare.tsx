import React, {
  ReactNode,
  useRef,
  cloneElement,
  Children,
  isValidElement,
  FC,
  ReactElement,
  CSSProperties,
} from "react";
import Button from "./Button";

type WebShareProps = {
  children: ReactNode;
  title?: string;
  defaultButtonPosition?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left";
  className?: string;
  style?: CSSProperties;
  withUrl?: boolean;
};

type WebShareButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  variant?: string;
};

const WebShareButton: FC<WebShareButtonProps> = ({
  children,
  onClick,
  className = "",
  style = {},
  variant = "primary",
}) => (
  <Button
    onClick={onClick}
    className={className}
    style={style}
    variant={variant}
  >
    {children}
  </Button>
);

const WebShare: FC<WebShareProps> & { Button: FC<WebShareButtonProps> } = ({
  children,
  title = "Check this out!",
  defaultButtonPosition = "top-right",
  className = "",
  style = {},
  withUrl = false,
  shareAsHtml = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (!navigator.share) {
      alert("Web Share API is not supported in your browser.");
      return;
    }

    const element = ref.current;
    if (!element) return;

    let text = element.innerText?.trim() || title;

    if (withUrl) {
      text = text + "\n" + window.location.href;
    }

    const img = element.querySelector("img") as HTMLImageElement | null;
    const svg = element.querySelector("svg") as SVGElement | null;
    const imageUrl = img?.src;

    const shareData: ShareData = {
      title,
      text,
    };

    if (imageUrl) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "shared-image.jpg", { type: blob.type });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
      } catch (err) {
        console.warn("Failed to fetch image for sharing:", err);
      }
    } else if (svg) {
      try {
        const svgBlob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
        const file = new File([svgBlob], "shared-image.svg", { type: "image/svg+xml" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
      } catch (err) {
        console.warn("Failed to process SVG for sharing:", err);
      }
    }

    if (shareData.files && shareData.text) {
      console.warn("Sharing with both files and text is not be supported, only the image will be shared.");
    }

    try {
      console.log("Sharing data:", shareData);
      await navigator.share(shareData);
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  let hasCustomButton = false;

  const processedChildren = Children.map(children, (child) => {
    if (
      isValidElement(child) &&
      (child.type === WebShareButton ||
        (child.type as any).displayName === "WebShareButton")
    ) {
      hasCustomButton = true;
      return cloneElement(child as ReactElement<WebShareButtonProps>, {
        onClick: handleShare,
      });
    }

    return child;
  });

  const positionStyles: Record<string, React.CSSProperties> = {
    "top-right": { position: "absolute", top: 8, right: 8 },
    "top-left": { position: "absolute", top: 8, left: 8 },
    "bottom-right": { position: "absolute", bottom: 8, right: 8 },
    "bottom-left": { position: "absolute", bottom: 8, left: 8 },
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "relative", ...style }}
    >
      {processedChildren}
      {!hasCustomButton && (
        <button
          onClick={handleShare}
          style={{
            ...positionStyles[defaultButtonPosition],
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "50%",
            padding: "6px 8px",
            cursor: "pointer",
          }}
          aria-label="Share"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-share"
            viewBox="0 0 16 16"
          >
            <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5m-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" />
          </svg>
        </button>
      )}
    </div>
  );
};

WebShareButton.displayName = "WebShareButton";
WebShare.Button = WebShareButton;

export default WebShare;
