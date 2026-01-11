/**
 * Google Maps Utility Functions
 */

/**
 * Generate Google Maps navigation URL
 */
export function getNavigationUrl(latitude: number, longitude: number): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

/**
 * Generate Google Maps embed URL
 */
export function getMapEmbedUrl(latitude: number, longitude: number, zoom: number = 15): string {
    return `https://www.google.com/maps/embed/v1/view?key=API_KEY&center=${latitude},${longitude}&zoom=${zoom}`;
}

/**
 * Generate Google Maps static image URL
 */
export function getStaticMapUrl(latitude: number, longitude: number, width: number = 600, height: number = 300): string {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=${width}x${height}&markers=color:red%7C${latitude},${longitude}`;
}
