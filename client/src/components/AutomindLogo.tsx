import automindLogo from "@assets/automind-symbol.png";

interface AutomindLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function AutomindLogo({ 
  size = "md", 
  showText = false, 
  className = "" 
}: AutomindLogoProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14", 
    lg: "w-20 h-20"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl"
  };

  return (
    <div className={`flex items-center ${showText ? 'space-x-4' : ''} ${className}`} data-testid="automind-logo">
      <img 
        src={automindLogo} 
        alt="Automind - Inteligência Artificial" 
        className={`${sizeClasses[size]} object-contain`}
        data-testid="logo-image"
      />
      {showText && (
        <h1 className={`${textSizeClasses[size]} font-bold text-white`} data-testid="logo-text">
          Automind
        </h1>
      )}
    </div>
  );
}
