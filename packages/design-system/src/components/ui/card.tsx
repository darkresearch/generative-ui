import { Text, TextClassContext } from './text';
import { cn } from '../../lib/utils';
import { View, type ViewProps, StyleSheet, Platform } from 'react-native';
import * as React from 'react';

function Card({ className, style, ...props }: ViewProps & React.RefAttributes<View>) {
  return (
    <TextClassContext.Provider value="text-slate-950 dark:text-slate-50">
      <View
        className={cn(
          'bg-white border-slate-200 flex flex-col gap-6 rounded-xl border py-6 shadow-sm shadow-black/5 dark:bg-slate-950 dark:border-slate-800',
          className
        )}
        style={[
          cardStyles.base,
          style,
        ]}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

const cardStyles = StyleSheet.create({
  base: {
    backgroundColor: '#ffffff', // Explicit white background for web
    borderWidth: 1,
    borderColor: '#e2e8f0', // slate-200
    borderRadius: 12, // rounded-xl
    paddingVertical: 24, // py-6 - vertical padding only, horizontal handled by CardHeader/Content/Footer
    flexDirection: 'column',
    gap: 24, // gap-6
    // Ensure text wrapping works
    flexWrap: 'wrap',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
    }),
  },
  header: {
    paddingHorizontal: 24, // px-6
    paddingTop: 0,
    paddingBottom: 0,
    flexDirection: 'column',
    gap: 6, // gap-1.5
    flexWrap: 'wrap',
  },
  title: {
    fontWeight: '600', // font-semibold
    flexWrap: 'wrap',
  },
  description: {
    color: '#64748b', // text-slate-500
    fontSize: 14, // text-sm
    flexWrap: 'wrap',
  },
  content: {
    paddingHorizontal: 24, // px-6
    paddingTop: 0,
    paddingBottom: 0,
    flexWrap: 'wrap',
  },
  footer: {
    paddingHorizontal: 24, // px-6
    paddingTop: 0,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});

function CardHeader({ className, style, ...props }: ViewProps & React.RefAttributes<View>) {
  return (
    <View
      className={cn('flex flex-col gap-1.5 px-6', className)}
      style={[cardStyles.header, style]}
      {...props}
    />
  );
}

function CardTitle({
  className,
  ...props
}: React.ComponentProps<typeof Text> & React.RefAttributes<Text>) {
  return (
    <Text
      role="heading"
      aria-level={3}
      className={cn('font-semibold leading-none', className)}
      style={cardStyles.title}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<typeof Text> & React.RefAttributes<Text>) {
  return (
    <Text
      className={cn('text-slate-500 text-sm dark:text-slate-400', className)}
      style={cardStyles.description}
      {...props}
    />
  );
}

function CardContent({ className, style, ...props }: ViewProps & React.RefAttributes<View>) {
  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'card.tsx:CardContent',message:'CardContent rendering',data:{paddingHorizontal:cardStyles.content.paddingHorizontal,platform:Platform.OS},timestamp:Date.now(),sessionId:'debug-session',runId:'card-padding-debug',hypothesisId:'A'})}).catch(()=>{});
  }, []);
  // #endregion
  
  return (
    <View
      className={cn('px-6', className)}
      style={[cardStyles.content, style]}
      {...props}
    />
  );
}

function CardFooter({ className, style, ...props }: ViewProps & React.RefAttributes<View>) {
  return (
    <View
      className={cn('flex flex-row items-center px-6', className)}
      style={[cardStyles.footer, style]}
      {...props}
    />
  );
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
