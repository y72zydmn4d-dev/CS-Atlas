/** Studio-only full document navigation; never accepts an authored content URL. */
export function navigateStudioDocument(href: string) { window.location.assign(href); }
