import { cn } from '../../lib/utils';
import { Platform, TextInput, type TextInputProps } from 'react-native';

function Textarea({
  className,
  multiline = true,
  numberOfLines = Platform.select({ web: 2, native: 8 }), // On web, numberOfLines also determines initial height. On native, it determines the maximum height.
  placeholderClassName,
  ...props
}: TextInputProps & React.RefAttributes<TextInput>) {
  return (
    <TextInput
      className={cn(
        'text-slate-950 border-gray-200 flex min-h-16 w-full flex-row rounded-md border bg-transparent px-3 py-2 text-base shadow-lg shadow-gray-200/50 md:text-sm ring-offset-white',
        Platform.select({
          web: 'placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 focus-visible:shadow-xl focus-visible:shadow-gray-300/60 transition-shadow disabled:cursor-not-allowed aria-invalid:ring-red-500/20 aria-invalid:border-red-500 field-sizing-content resize-y',
        }),
        props.editable === false && 'opacity-50',
        className
      )}
      placeholderClassName={cn('text-slate-500 dark:text-slate-400', placeholderClassName)}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      {...props}
    />
  );
}

export { Textarea };
