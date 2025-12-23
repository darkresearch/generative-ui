import React from 'react';
import * as LucideIcons from 'lucide-react-native';

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

// Type for lucide icon components
type LucideIconComponent = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

/**
 * Icon component for web - uses Lucide SVG icons
 *
 * Converts icon names to PascalCase and looks them up in lucide-react-native.
 * Example: "plus" -> "Plus", "chevron-right" -> "ChevronRight"
 */
export function Icon({ name, size = 24, color = '#000', strokeWidth }: IconProps) {
  // Convert name to PascalCase (e.g., "chevron-right" -> "ChevronRight")
  const pascalName = name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  // Look up the icon component from lucide-react-native
  // Use unknown first to avoid type comparison issues with mixed exports
  const IconComponent = (LucideIcons as unknown as Record<string, LucideIconComponent>)[pascalName];

  if (!IconComponent || typeof IconComponent !== 'function') {
    console.warn(`Icon "${name}" (resolved to "${pascalName}") not found in lucide-react-native`);
    return null;
  }

  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} />;
}

