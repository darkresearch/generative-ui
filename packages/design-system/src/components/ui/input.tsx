import { cn } from '../../lib/utils';
import { Platform, TextInput, type TextInputProps } from 'react-native';

function Input({
  className,
  placeholderClassName,
  ...props
}: TextInputProps & React.RefAttributes<TextInput>) {
  return (
    <TextInput
      className={cn(
        'dark:bg-slate-200/30 border-slate-200 bg-white text-slate-950 flex h-10 w-full min-w-0 flex-row items-center rounded-md border px-3 py-1 text-base leading-5 shadow-sm shadow-black/5 sm:h-9 dark:dark:bg-slate-800/30 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50',
        props.editable === false &&
          cn(
            'opacity-50',
            Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' })
          ),
        Platform.select({
          web: cn(
            'placeholder:text-slate-500 selection:bg-slate-900 selection:text-slate-50 outline-none transition-[color,box-shadow] md:text-sm dark:placeholder:text-slate-400 dark:selection:bg-slate-50 dark:selection:text-slate-900',
            'focus-visible:border-slate-950 focus-visible:ring-slate-950/50 focus-visible:ring-[3px] dark:focus-visible:border-slate-300 dark:focus-visible:ring-slate-300/50',
            'aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-500 dark:aria-invalid:ring-red-900/20 dark:dark:aria-invalid:ring-red-900/40 dark:aria-invalid:border-red-900'
          ),
          native: 'placeholder:text-slate-500/50 dark:placeholder:text-slate-400/50',
        }),
        className
      )}
      {...props}
    />
  );
}

export { Input };
