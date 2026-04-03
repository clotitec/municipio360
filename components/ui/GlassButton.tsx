"use client";

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
}

export default function GlassButton({
  children,
  onClick,
  className = "",
  variant = "primary",
  disabled = false,
  type = "button",
}: GlassButtonProps) {
  const variants = {
    primary: "bg-white/80 hover:bg-white/90 text-gray-900 shadow-md",
    secondary: "bg-black/10 hover:bg-black/20 text-gray-800 backdrop-blur-lg",
    ghost: "bg-transparent hover:bg-white/30 text-gray-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2.5 rounded-xl font-medium text-sm
        backdrop-blur-xl border border-white/30
        transition-all duration-200 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </button>
  );
}
