import {
  ArrowSquareOut,
  BookOpen,
  Books,
  CaretDown,
  CaretLeft,
  CaretRight,
  ChatCircle,
  Check,
  DownloadSimple,
  GearSix,
  GlobeSimple,
  Heart,
  House,
  Image,
  List,
  Lock,
  PaperPlaneTilt,
  SignOut,
  Sparkle,
  User,
  X,
} from "@phosphor-icons/react/dist/ssr";
import type { IconProps as PhosphorIconProps } from "@phosphor-icons/react";
import type { ComponentType } from "react";

export type IconName =
  | "arrowLeft"
  | "arrowRight"
  | "arrowDown"
  | "book"
  | "check"
  | "close"
  | "download"
  | "external"
  | "globe"
  | "heart"
  | "home"
  | "image"
  | "library"
  | "lock"
  | "logout"
  | "menu"
  | "message"
  | "send"
  | "settings"
  | "spark"
  | "user";

type IconProps = Omit<PhosphorIconProps, "name"> & {
  name: IconName;
};

const icons: Record<IconName, ComponentType<PhosphorIconProps>> = {
  arrowDown: CaretDown,
  arrowLeft: CaretLeft,
  arrowRight: CaretRight,
  book: BookOpen,
  check: Check,
  close: X,
  download: DownloadSimple,
  external: ArrowSquareOut,
  globe: GlobeSimple,
  heart: Heart,
  home: House,
  image: Image,
  library: Books,
  lock: Lock,
  logout: SignOut,
  menu: List,
  message: ChatCircle,
  send: PaperPlaneTilt,
  settings: GearSix,
  spark: Sparkle,
  user: User,
};

export function Icon({ name, weight = "regular", ...props }: IconProps) {
  const Component = icons[name];
  return <Component aria-hidden="true" weight={weight} {...props} />;
}
