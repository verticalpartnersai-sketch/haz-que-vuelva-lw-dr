import {
  ArrowSquareOut,
  CaretDown,
  CaretLeft,
  CaretRight,
  Check,
  GlobeSimple,
  Heart,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import type { IconProps as PhosphorIconProps } from "@phosphor-icons/react";
import type { ComponentType } from "react";

export type IconName =
  | "arrowDown"
  | "arrowLeft"
  | "arrowRight"
  | "check"
  | "external"
  | "globe"
  | "heart"
  | "spark";

type IconProps = Omit<PhosphorIconProps, "name"> & { name: IconName };

const icons: Record<IconName, ComponentType<PhosphorIconProps>> = {
  arrowDown: CaretDown,
  arrowLeft: CaretLeft,
  arrowRight: CaretRight,
  check: Check,
  external: ArrowSquareOut,
  globe: GlobeSimple,
  heart: Heart,
  spark: Sparkle,
};

export function Icon({ name, weight = "regular", ...props }: IconProps) {
  const Component = icons[name];
  return <Component aria-hidden="true" weight={weight} {...props} />;
}
