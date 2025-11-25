import { NativeOnlyAnimatedView } from './native-only-animated-view';
import { TextClassContext } from './text';
import { cn } from '../../lib/utils';
import * as PopoverPrimitive from '@rn-primitives/popover';
import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const FullWindowOverlay = Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

function LoggingWrapper({ children, location, message, data, hypothesisId }: { children: React.ReactNode; location: string; message: string; data: any; hypothesisId: string }) {
  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location,message,data,timestamp:Date.now(),sessionId:'debug-session',runId:'popover-debug-v2',hypothesisId})}).catch(()=>{});
  }, []);
  // #endregion
  return <>{children}</>;
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  portalHost,
  ...props
}: PopoverPrimitive.ContentProps &
  React.RefAttributes<PopoverPrimitive.ContentRef> & {
    portalHost?: string;
  }) {
  const context = PopoverPrimitive.useRootContext();
  
  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'popover.tsx:PopoverContent',message:'PopoverContent function called',data:{align,sideOffset,hasClassName:!!className,contextOpen:context.open},timestamp:Date.now(),sessionId:'debug-session',runId:'popover-debug-v2',hypothesisId:'A'})}).catch(()=>{});
  }, [context.open]);
  // #endregion

  return (
    <PopoverPrimitive.Portal hostName={portalHost}>
      <LoggingWrapper location="popover.tsx:Portal" message="Portal rendering" data={{contextOpen:context.open,portalHost}} hypothesisId="B">
        <FullWindowOverlay>
          <LoggingWrapper location="popover.tsx:FullWindowOverlay" message="FullWindowOverlay rendering" data={{contextOpen:context.open,platform:Platform.OS}} hypothesisId="C">
            <PopoverPrimitive.Overlay 
              style={Platform.select({ native: StyleSheet.absoluteFill })}
              closeOnPress={false}
              onPress={() => {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'popover.tsx:Overlay.onPress',message:'Overlay pressed',data:{contextOpen:context.open},timestamp:Date.now(),sessionId:'debug-session',runId:'popover-debug-v2',hypothesisId:'E'})}).catch(()=>{});
                // #endregion
                context.onOpenChange(false);
              }}
            >
              <LoggingWrapper location="popover.tsx:Overlay" message="Overlay rendering" data={{contextOpen:context.open}} hypothesisId="D">
                <LoggingWrapper location="popover.tsx:Content" message="Content rendering" data={{contextOpen:context.open,align,sideOffset}} hypothesisId="F">
                  <NativeOnlyAnimatedView entering={FadeIn.duration(200)} exiting={FadeOut}>
                    <TextClassContext.Provider value="text-slate-950 dark:text-slate-50">
                      <PopoverPrimitive.Content
                        align={align}
                        sideOffset={sideOffset}
                        className={cn(
                          'bg-white border-slate-200 outline-hidden z-50 w-72 rounded-md border p-4 shadow-md shadow-black/5 dark:bg-slate-950 dark:border-slate-800',
                          Platform.select({
                            web: cn(
                              'animate-in fade-in-0 zoom-in-95 origin-(--radix-popover-content-transform-origin) cursor-auto',
                              props.side === 'bottom' && 'slide-in-from-top-2',
                              props.side === 'top' && 'slide-in-from-bottom-2'
                            ),
                          }),
                          className
                        )}
                        {...props}
                      />
                    </TextClassContext.Provider>
                  </NativeOnlyAnimatedView>
                </LoggingWrapper>
              </LoggingWrapper>
            </PopoverPrimitive.Overlay>
          </LoggingWrapper>
        </FullWindowOverlay>
      </LoggingWrapper>
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverContent, PopoverTrigger };
