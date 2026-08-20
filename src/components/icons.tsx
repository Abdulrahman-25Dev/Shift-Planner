import React from "react";
import { Ionicons as IoniconsBase } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import {
  ALargeSmall as ALargeSmallBase,
  ArrowRight as ArrowRightBase,
  Atom as AtomBase,
  Bell as BellBase,
  Bug as BugBase,
  Calendar as CalendarBase,
  Camera as CameraBase,
  Check as CheckBase,
  CheckCircle2 as CheckCircle2Base,
  ChevronLeft as ChevronLeftBase,
  ChevronRight as ChevronRightBase,
  Clock as ClockBase,
  Clock10 as Clock10Base,
  Code2 as Code2Base,
  Database as DatabaseBase,
  Eye as EyeBase,
  EyeOff as EyeOffBase,
  Flame as FlameBase,
  Globe as GlobeBase,
  GraduationCap as GraduationCapBase,
  HardDrive as HardDriveBase,
  Info as InfoBase,
  KeyRound as KeyRoundBase,
  Languages as LanguagesBase,
  Lightbulb as LightbulbBase,
  LogOut as LogOutBase,
  Moon as MoonBase,
  Mosque as MosqueBase,
  Palette as PaletteBase,
  PawPrint as PawPrintBase,
  RefreshCw as RefreshCwBase,
  Settings as SettingsBase,
  Sun as SunBase,
  Trash2 as Trash2Base,
  User as UserBase,
  UserX as UserXBase,
  WifiOff as WifiOffBase,
} from "lucide-react-native";

type IconProps = { size?: number | string };

function makeScaledIcon<T extends IconProps>(
  Base: React.ComponentType<T>,
) {
  return function ScaledIcon(props: T) {
    const fontScale = useAppStore((s) => s.fontScale);
    const base = props.size === undefined ? 24 : Number(props.size);
    return (
      <Base {...props} size={Math.max(1, Math.round(base * fontScale))} />
    );
  };
}

// Lucide icons (fontScale-aware)
export const ALargeSmall = makeScaledIcon(ALargeSmallBase);
export const ArrowRight = makeScaledIcon(ArrowRightBase);
export const Atom = makeScaledIcon(AtomBase);
export const Bell = makeScaledIcon(BellBase);
export const Bug = makeScaledIcon(BugBase);
export const Calendar = makeScaledIcon(CalendarBase);
export const Camera = makeScaledIcon(CameraBase);
export const Check = makeScaledIcon(CheckBase);
export const CheckCircle2 = makeScaledIcon(CheckCircle2Base);
export const ChevronLeft = makeScaledIcon(ChevronLeftBase);
export const ChevronRight = makeScaledIcon(ChevronRightBase);
export const Clock = makeScaledIcon(ClockBase);
export const Clock10 = makeScaledIcon(Clock10Base);
export const Code2 = makeScaledIcon(Code2Base);
export const Database = makeScaledIcon(DatabaseBase);
export const Eye = makeScaledIcon(EyeBase);
export const EyeOff = makeScaledIcon(EyeOffBase);
export const Flame = makeScaledIcon(FlameBase);
export const Globe = makeScaledIcon(GlobeBase);
export const GraduationCap = makeScaledIcon(GraduationCapBase);
export const HardDrive = makeScaledIcon(HardDriveBase);
export const Info = makeScaledIcon(InfoBase);
export const KeyRound = makeScaledIcon(KeyRoundBase);
export const Languages = makeScaledIcon(LanguagesBase);
export const Lightbulb = makeScaledIcon(LightbulbBase);
export const LogOut = makeScaledIcon(LogOutBase);
export const Moon = makeScaledIcon(MoonBase);
export const Mosque = makeScaledIcon(MosqueBase);
export const Palette = makeScaledIcon(PaletteBase);
export const PawPrint = makeScaledIcon(PawPrintBase);
export const RefreshCw = makeScaledIcon(RefreshCwBase);
export const Settings = makeScaledIcon(SettingsBase);
export const Sun = makeScaledIcon(SunBase);
export const Trash2 = makeScaledIcon(Trash2Base);
export const User = makeScaledIcon(UserBase);
export const UserX = makeScaledIcon(UserXBase);
export const WifiOff = makeScaledIcon(WifiOffBase);

// Ionicons (fontScale-aware)
export const Ionicons = makeScaledIcon(IoniconsBase);
export type IoniconName = keyof typeof IoniconsBase.glyphMap;