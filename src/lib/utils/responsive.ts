/**
 * Utility functions for responsive design
 */

/**
 * Returns a CSS class string for responsive padding
 * @param base Base padding value (for mobile)
 * @param sm Small screen padding value
 * @param md Medium screen padding value
 * @param lg Large screen padding value
 * @returns CSS class string
 */
export function responsivePadding(
  base: string = 'p-4',
  sm: string = 'sm:p-6',
  md: string = 'md:p-8',
  lg: string = 'lg:p-10'
): string {
  return `${base} ${sm} ${md} ${lg}`;
}

/**
 * Returns a CSS class string for responsive margin
 * @param base Base margin value (for mobile)
 * @param sm Small screen margin value
 * @param md Medium screen margin value
 * @param lg Large screen margin value
 * @returns CSS class string
 */
export function responsiveMargin(
  base: string = 'm-4',
  sm: string = 'sm:m-6',
  md: string = 'md:m-8',
  lg: string = 'lg:m-10'
): string {
  return `${base} ${sm} ${md} ${lg}`;
}

/**
 * Returns a CSS class string for responsive font size
 * @param base Base font size (for mobile)
 * @param sm Small screen font size
 * @param md Medium screen font size
 * @param lg Large screen font size
 * @returns CSS class string
 */
export function responsiveFontSize(
  base: string = 'text-base',
  sm: string = 'sm:text-lg',
  md: string = 'md:text-xl',
  lg: string = 'lg:text-2xl'
): string {
  return `${base} ${sm} ${md} ${lg}`;
}

/**
 * Returns a CSS class string for responsive width
 * @param base Base width (for mobile)
 * @param sm Small screen width
 * @param md Medium screen width
 * @param lg Large screen width
 * @returns CSS class string
 */
export function responsiveWidth(
  base: string = 'w-full',
  sm: string = 'sm:w-auto',
  md: string = '',
  lg: string = ''
): string {
  return `${base} ${sm} ${md} ${lg}`.trim();
}

/**
 * Returns a CSS class string for responsive height
 * @param base Base height (for mobile)
 * @param sm Small screen height
 * @param md Medium screen height
 * @param lg Large screen height
 * @returns CSS class string
 */
export function responsiveHeight(
  base: string = 'h-auto',
  sm: string = '',
  md: string = '',
  lg: string = ''
): string {
  return `${base} ${sm} ${md} ${lg}`.trim();
}

/**
 * Returns a CSS class string for responsive flex direction
 * @param mobile Direction for mobile
 * @param desktop Direction for desktop
 * @returns CSS class string
 */
export function responsiveFlexDirection(
  mobile: 'flex-col' | 'flex-row' = 'flex-col',
  desktop: 'sm:flex-row' | 'sm:flex-col' = 'sm:flex-row'
): string {
  return `${mobile} ${desktop}`;
}

/**
 * Returns a CSS class string for responsive grid columns
 * @param base Base grid columns (for mobile)
 * @param sm Small screen grid columns
 * @param md Medium screen grid columns
 * @param lg Large screen grid columns
 * @returns CSS class string
 */
export function responsiveGridCols(
  base: string = 'grid-cols-1',
  sm: string = 'sm:grid-cols-2',
  md: string = 'md:grid-cols-3',
  lg: string = 'lg:grid-cols-4'
): string {
  return `${base} ${sm} ${md} ${lg}`;
}

export default {
  responsivePadding,
  responsiveMargin,
  responsiveFontSize,
  responsiveWidth,
  responsiveHeight,
  responsiveFlexDirection,
  responsiveGridCols,
};