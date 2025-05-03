import React from 'react'; // Import React explicitly if needed, depends on project setup
import './ShinyText.css';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number; // Speed in seconds for one animation cycle
  className?: string;
  as?: React.ElementType; // Optional: Render as different element like 'span', 'h1'
}

const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 5,
  className = '',
  as: Component = 'div' // Default to 'div', allow overriding
}) => {
  const animationDuration = `${speed}s`;

  // Define the style object, setting the CSS variable
  // Use 'as React.CSSProperties' to satisfy TypeScript for custom properties
  const style = {
    '--shine-duration': animationDuration
  } as React.CSSProperties;

  return (
    // Use the 'as' prop to render the specified component type ('div', 'span', etc.)
    <Component
      className={`shiny-text ${disabled ? 'disabled' : ''} ${className}`}
      style={style} // Apply the style object setting the CSS variable
    >
      {text}
    </Component>
  );
};

export default ShinyText;