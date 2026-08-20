import React from "react";
import {
  Text as RNText,
  StyleSheet,
  type TextProps,
  type TextStyle,
} from "react-native";
import { cssInterop } from "nativewind";
import { useAppStore } from "@/store/useAppStore";

export type { TextProps };

/**
 * Global text scaler.
 *
 * Registered with NativeWind so `className` is resolved into the `style`
 * prop (cssInterop). Every rendered <Text> across the app uses this
 * component, which multiplies the resolved fontSize by the store-wide
 * `fontScale` factor (0.5 – 1.5). Changing `fontScale` in Settings
 * re-renders every text node and resizes it instantly.
 */
function ScaledText({ style, ...props }: TextProps) {
  const fontScale = useAppStore((s) => s.fontScale);

  if (fontScale !== 1) {
    const flat = StyleSheet.flatten(style) as TextStyle | undefined;
    const fontSize =
      flat && typeof flat === "object" && "fontSize" in flat
        ? (flat.fontSize as number)
        : undefined;

    if (fontSize != null) {
      return <RNText {...props} style={[style, { fontSize: fontSize * fontScale }]} />;
    }
  }

  return <RNText {...props} style={style} />;
}

cssInterop(ScaledText, { className: "style" });

export default ScaledText;