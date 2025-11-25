import { Icon } from './icon';
import { NativeOnlyAnimatedView } from './native-only-animated-view';
import { TextClassContext } from './text';
import { cn } from '../../lib/utils';
import * as MenubarPrimitive from '@rn-primitives/menubar';
import { Portal } from '@rn-primitives/portal';
import { Check, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react-native';
import * as React from 'react';
import {
  Platform,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  type TextProps,
  View,
  type ViewStyle,
} from 'react-native';
import { FadeIn } from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';

const MenubarMenu = MenubarPrimitive.Menu;

const MenubarGroup = MenubarPrimitive.Group;

const MenubarPortal = MenubarPrimitive.Portal;

const MenubarSub = MenubarPrimitive.Sub;

const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

const FullWindowOverlay = Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

function Menubar({
  className,
  value: valueProp,
  onValueChange: onValueChangeProp,
  ...props
}: MenubarPrimitive.RootProps & React.RefAttributes<MenubarPrimitive.RootRef>) {
  const id = React.useId();
  const [value, setValue] = React.useState<string | undefined>(undefined);

  function closeMenu() {
    if (onValueChangeProp) {
      onValueChangeProp(undefined);
      return;
    }
    setValue(undefined);
  }

  return (
    <>
      {Platform.OS !== 'web' && (value || valueProp) ? (
        <Portal name={`menubar-overlay-${id}`}>
          <Pressable onPress={closeMenu} style={StyleSheet.absoluteFill} />
        </Portal>
      ) : null}
      <MenubarPrimitive.Root
        className={cn(
          'bg-white border-slate-200 flex h-10 flex-row items-center gap-1 rounded-md border p-1 shadow-sm shadow-black/5 sm:h-9 dark:bg-slate-950 dark:border-slate-800',
          className
        )}
        value={value ?? valueProp}
        onValueChange={onValueChangeProp ?? setValue}
        {...props}
      />
    </>
  );
}

function MenubarTrigger({
  className,
  ...props
}: MenubarPrimitive.TriggerProps & React.RefAttributes<MenubarPrimitive.TriggerRef>) {
  const { value } = MenubarPrimitive.useRootContext();
  const { value: itemValue } = MenubarPrimitive.useMenuContext();

  return (
    <TextClassContext.Provider
      value={cn(
        'text-sm font-medium select-none group-active:text-slate-900 dark:group-active:text-slate-50',
        value === itemValue && 'text-slate-900 dark:text-slate-50'
      )}>
      <MenubarPrimitive.Trigger
        className={cn(
          'group flex items-center rounded-md px-2 py-1.5 sm:py-1',
          Platform.select({
            web: 'focus:bg-slate-100 focus:text-slate-900 cursor-default outline-none dark:focus:bg-slate-800 dark:focus:text-slate-50',
          }),
          value === itemValue && 'bg-slate-100 dark:bg-slate-800',
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  iconClassName,
  ...props
}: MenubarPrimitive.SubTriggerProps &
  React.RefAttributes<MenubarPrimitive.SubTriggerRef> & {
    children?: React.ReactNode;
    iconClassName?: string;
    inset?: boolean;
  }) {
  const { open } = MenubarPrimitive.useSubContext();
  const icon = Platform.OS === 'web' ? ChevronRight : open ? ChevronUp : ChevronDown;
  return (
    <TextClassContext.Provider
      value={cn(
        'text-sm select-none group-active:text-slate-900 dark:group-active:text-slate-50',
        open && 'text-slate-900 dark:text-slate-50'
      )}>
      <MenubarPrimitive.SubTrigger
        className={cn(
          'active:bg-slate-100 group flex flex-row items-center rounded-sm px-2 py-2 sm:py-1.5 dark:active:bg-slate-800',
          Platform.select({
            web: 'focus:bg-slate-100 focus:text-slate-900 cursor-default outline-none [&_svg]:pointer-events-none dark:focus:bg-slate-800 dark:focus:text-slate-50',
          }),
          open && 'bg-slate-100 dark:bg-slate-800',
          inset && 'pl-8'
        )}
        {...props}>
        <>{children}</>
        <Icon as={icon} className={cn('text-slate-950 ml-auto size-4 shrink-0 dark:text-slate-50', iconClassName)} />
      </MenubarPrimitive.SubTrigger>
    </TextClassContext.Provider>
  );
}

function MenubarSubContent({
  className,
  ...props
}: MenubarPrimitive.SubContentProps & React.RefAttributes<MenubarPrimitive.SubContentRef>) {
  return (
    <NativeOnlyAnimatedView entering={FadeIn}>
      <MenubarPrimitive.SubContent
        className={cn(
          'bg-white border-slate-200 overflow-hidden rounded-md border p-1 shadow-lg shadow-black/5 dark:bg-slate-950 dark:border-slate-800',
          Platform.select({
            web: 'animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 fade-in-0 data-[state=closed]:zoom-out-95 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-context-menu-content-transform-origin) z-50 min-w-[8rem]',
          }),
          className
        )}
        {...props}
      />
    </NativeOnlyAnimatedView>
  );
}

function MenubarContent({
  className,
  overlayClassName,
  overlayStyle,
  portalHost,
  align = 'start',
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: MenubarPrimitive.ContentProps &
  React.RefAttributes<MenubarPrimitive.ContentRef> & {
    overlayStyle?: StyleProp<ViewStyle>;
    overlayClassName?: string;
    portalHost?: string;
  }) {
  return (
    <MenubarPrimitive.Portal hostName={portalHost}>
      <FullWindowOverlay>
        <NativeOnlyAnimatedView
          entering={FadeIn}
          style={StyleSheet.absoluteFill}
          pointerEvents="box-none">
          <TextClassContext.Provider value="text-slate-950 dark:text-slate-50">
            <MenubarPrimitive.Content
              className={cn(
                'bg-white border-slate-200 min-w-[12rem] overflow-hidden rounded-md border p-1 shadow-lg shadow-black/5 dark:bg-slate-950 dark:border-slate-800',
                Platform.select({
                  web: cn(
                    'animate-in fade-in-0 zoom-in-95 max-h-(--radix-context-menu-content-available-height) origin-(--radix-context-menu-content-transform-origin) z-50 cursor-default',
                    props.side === 'bottom' && 'slide-in-from-top-2',
                    props.side === 'top' && 'slide-in-from-bottom-2'
                  ),
                }),
                className
              )}
              align={align}
              alignOffset={alignOffset}
              sideOffset={sideOffset}
              {...props}
            />
          </TextClassContext.Provider>
        </NativeOnlyAnimatedView>
      </FullWindowOverlay>
    </MenubarPrimitive.Portal>
  );
}

function MenubarItem({
  className,
  inset,
  variant,
  ...props
}: MenubarPrimitive.ItemProps &
  React.RefAttributes<MenubarPrimitive.ItemRef> & {
    className?: string;
    inset?: boolean;
    variant?: 'default' | 'destructive';
  }) {
  return (
    <TextClassContext.Provider
      value={cn(
        'select-none text-sm text-slate-950 group-active:text-slate-950 dark:text-slate-50 dark:group-active:text-slate-50',
        variant === 'destructive' && 'text-red-500 group-active:text-red-500 dark:text-red-900 dark:group-active:text-red-900'
      )}>
      <MenubarPrimitive.Item
        className={cn(
          'active:bg-slate-100 group relative flex flex-row items-center gap-2 rounded-sm px-2 py-2 sm:py-1.5 dark:active:bg-slate-800',
          Platform.select({
            web: cn(
              'focus:bg-slate-100 focus:text-slate-900 cursor-default outline-none data-[disabled]:pointer-events-none dark:focus:bg-slate-800 dark:focus:text-slate-50',
              variant === 'destructive' && 'focus:bg-red-500/10 dark:focus:bg-red-500/20 dark:focus:bg-red-900/10 dark:dark:focus:bg-red-900/20'
            ),
          }),
          variant === 'destructive' && 'active:bg-red-500/10 dark:active:bg-red-500/20 dark:active:bg-red-900/10 dark:dark:active:bg-red-900/20',
          props.disabled && 'opacity-50',
          inset && 'pl-8',
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

function MenubarCheckboxItem({
  className,
  children,
  ...props
}: MenubarPrimitive.CheckboxItemProps &
  React.RefAttributes<MenubarPrimitive.CheckboxItemRef> & {
    children?: React.ReactNode;
  }) {
  return (
    <TextClassContext.Provider value="text-sm text-slate-950 select-none group-active:text-slate-900 dark:text-slate-50 dark:group-active:text-slate-50">
      <MenubarPrimitive.CheckboxItem
        className={cn(
          'active:bg-slate-100 group relative flex flex-row items-center gap-2 rounded-sm py-2 pl-8 pr-2 sm:py-1.5 dark:active:bg-slate-800',
          Platform.select({
            web: 'focus:bg-slate-100 focus:text-slate-900 cursor-default outline-none data-[disabled]:pointer-events-none dark:focus:bg-slate-800 dark:focus:text-slate-50',
          }),
          props.disabled && 'opacity-50',
          className
        )}
        {...props}>
        <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <MenubarPrimitive.ItemIndicator>
            <Icon
              as={Check}
              className={cn(
                'text-slate-950 size-4 dark:text-slate-50',
                Platform.select({ web: 'pointer-events-none' })
              )}
            />
          </MenubarPrimitive.ItemIndicator>
        </View>
        <>{children}</>
      </MenubarPrimitive.CheckboxItem>
    </TextClassContext.Provider>
  );
}

function MenubarRadioItem({
  className,
  children,
  ...props
}: MenubarPrimitive.RadioItemProps &
  React.RefAttributes<MenubarPrimitive.RadioItemRef> & {
    children?: React.ReactNode;
  }) {
  return (
    <TextClassContext.Provider value="text-sm text-slate-950 select-none group-active:text-slate-900 dark:text-slate-50 dark:group-active:text-slate-50">
      <MenubarPrimitive.RadioItem
        className={cn(
          'active:bg-slate-100 group relative flex flex-row items-center gap-2 rounded-sm py-2 pl-8 pr-2 sm:py-1.5 dark:active:bg-slate-800',
          Platform.select({
            web: 'focus:bg-slate-100 focus:text-slate-900 cursor-default outline-none data-[disabled]:pointer-events-none dark:focus:bg-slate-800 dark:focus:text-slate-50',
          }),
          props.disabled && 'opacity-50',
          className
        )}
        {...props}>
        <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <MenubarPrimitive.ItemIndicator>
            <View className="bg-slate-950 h-2 w-2 rounded-full dark:bg-slate-50" />
          </MenubarPrimitive.ItemIndicator>
        </View>
        <>{children}</>
      </MenubarPrimitive.RadioItem>
    </TextClassContext.Provider>
  );
}

function MenubarLabel({
  className,
  inset,
  ...props
}: MenubarPrimitive.LabelProps &
  React.RefAttributes<MenubarPrimitive.LabelRef> & {
    className?: string;
    inset?: boolean;
  }) {
  return (
    <MenubarPrimitive.Label
      className={cn(
        'text-slate-950 px-2 py-2 text-sm font-medium sm:py-1.5 dark:text-slate-50',
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  );
}

function MenubarSeparator({
  className,
  ...props
}: MenubarPrimitive.SeparatorProps & React.RefAttributes<MenubarPrimitive.SeparatorRef>) {
  return (
    <MenubarPrimitive.Separator className={cn('bg-slate-200 -mx-1 my-1 h-px dark:bg-slate-800', className)} {...props} />
  );
}

function MenubarShortcut({ className, ...props }: TextProps & React.RefAttributes<Text>) {
  return (
    <Text
      className={cn('text-slate-500 ml-auto text-xs tracking-widest dark:text-slate-400', className)}
      {...props}
    />
  );
}

export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
};
