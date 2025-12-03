/**
 * @darkresearch/debug-components
 * 
 * Shared debug components for streamdown-rn testing and development.
 * Used by debugger (web) and debugger-ios apps.
 */

// Main registry export
export { debugComponentRegistry, getRegisteredComponents } from './registry';

// Component exports (for direct usage or extension)
export {
  StatusCard,
  StatusCardSkeleton,
  StatusCardSchema,
  type StatusCardProps,
  Stack,
  StackSkeleton,
  StackSchema,
  type StackProps,
  Card,
  CardSkeleton,
  CardSchema,
  type CardProps,
} from './components';

