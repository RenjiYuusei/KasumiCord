import { normalizeToHex } from "./colors/parser";
import { VendettaThemeManifest } from "./colors/types";

function extractMatch(content: string, regex: RegExp): string | null {
    const match = content.match(regex);
    return match ? match[1].trim() : null;
}

export function normalizeThemeUrl(url: string): string {
    let target = url.trim();
    if (target.includes("betterdiscord.app/theme?id=") || target.includes("betterdiscord.app/themes?id=")) {
        const idMatch = target.match(/[?&]id=([^&#]+)/);
        if (idMatch) {
            target = `https://betterdiscord.app/download?id=${idMatch[1]}`;
        }
    } else if (/betterdiscord\.app\/themes?\/([0-9a-zA-Z_-]+)/.test(target)) {
        const idMatch = target.match(/betterdiscord\.app\/themes?\/([0-9a-zA-Z_-]+)/);
        if (idMatch) {
            target = `https://betterdiscord.app/download?id=${idMatch[1]}`;
        }
    } else if (target.includes("github.com") && target.includes("/blob/")) {
        target = target.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
    }
    return target;
}

export function parseBetterDiscordCss(css: string, sourceUrl: string): VendettaThemeManifest {
    // 1. Extract metadata from header
    const name = extractMatch(css, /@name\s+([^\r\n*]+)/) ||
                 extractMatch(css, /\/\*\*\s*\n\s*\*\s*@name\s+([^\r\n*]+)/) ||
                 "BetterDiscord Theme";
    const author = extractMatch(css, /@author\s+([^\r\n*]+)/) || "BetterDiscord";
    const description = extractMatch(css, /@description\s+([^\r\n*]+)/) || "Imported BetterDiscord theme";

    // 2. Extract background image
    const bgUrlMatch = css.match(/(?:--background-image|background-image|--background|background)\s*:\s*url\(\s*['"]?(https?:\/\/[^)'"\s]+)['"]?\s*\)/i);
    const bgUrl = bgUrlMatch ? bgUrlMatch[1] : null;

    // 3. Extract CSS variables and colors
    const findColor = (...names: string[]): string | undefined => {
        for (const varName of names) {
            const regex = new RegExp(`(?:--${varName}|${varName})\\s*:\\s*([^;\\r\\n]+)`, "i");
            const match = css.match(regex);
            if (match) {
                const hex = normalizeToHex(match[1].trim());
                if (hex) return hex;
            }
        }
        return undefined;
    };

    const mainColor = findColor("main-color", "accentcolor", "accent-color", "brand-color", "accent", "primary-color") || "#5865f2";
    const bgPrimary = findColor("background-primary", "bg-primary", "background-dark", "main-bg") || "#1e1f29";
    const bgSecondary = findColor("background-secondary", "bg-secondary", "secondary-bg") || "#18191f";
    const bgTertiary = findColor("background-tertiary", "bg-tertiary", "darker-bg") || "#121317";
    const textNormal = findColor("text-normal", "text-default", "primary-text", "text-color") || "#f8f8f2";
    const textMuted = findColor("text-muted", "secondary-text", "muted-text") || "#6272a4";
    const hoverColor = findColor("hover-color", "interactive-hover") || mainColor;

    return {
        spec: 2,
        name: name,
        description: description,
        authors: [{ name: author }],
        background: bgUrl ? {
            url: bgUrl,
            alpha: 0.85,
            blur: 0
        } : undefined,
        semanticColors: {
            BACKGROUND_PRIMARY: [bgPrimary, "#ffffff"],
            BACKGROUND_SECONDARY: [bgSecondary, "#f2f3f5"],
            BACKGROUND_SECONDARY_ALT: [bgSecondary, "#f2f3f5"],
            BACKGROUND_TERTIARY: [bgTertiary, "#e3e5e8"],
            BACKGROUND_FLOATING: [bgSecondary, "#ffffff"],
            BACKGROUND_MOBILE_PRIMARY: [bgPrimary, "#ffffff"],
            BACKGROUND_MOBILE_SECONDARY: [bgSecondary, "#f2f3f5"],
            TEXT_NORMAL: [textNormal, "#2e3338"],
            TEXT_MUTED: [textMuted, "#747f8d"],
            HEADER_PRIMARY: [textNormal, "#060607"],
            HEADER_SECONDARY: [textMuted, "#4f545c"],
            INTERACTIVE_NORMAL: [textMuted, "#4f545c"],
            INTERACTIVE_HOVER: [hoverColor, "#2e3338"],
            INTERACTIVE_ACTIVE: [mainColor, "#060607"],
            BRAND_NEW_500: [mainColor, mainColor],
            BRAND_EXPERIMENT: [mainColor, mainColor]
        },
        rawColors: {
            BRAND_500: mainColor,
            PRIMARY_600: bgPrimary,
            PRIMARY_630: bgSecondary,
            PRIMARY_800: bgTertiary
        }
    };
}

export function convertAliucordTheme(json: any): VendettaThemeManifest {
    const manifest = json.manifest || {};
    const name = manifest.name || json.name || "Aliucord Theme";
    const author = manifest.author || json.author || "Unknown";
    const description = manifest.description || json.description || "";

    const bgUrl = json.background?.url || (typeof json.background === "string" ? json.background : undefined);
    const bgPrimary = normalizeToHex(json.color_primary_dark || json.color_surface || json.background_primary) || "#1e1f29";
    const bgSecondary = normalizeToHex(json.color_secondary_dark || json.color_surface_variant || json.background_secondary) || "#18191f";
    const mainColor = normalizeToHex(json.color_brand || json.color_primary || json.accent_color) || "#5865f2";
    const textNormal = normalizeToHex(json.color_text_normal || json.color_on_surface) || "#f8f8f2";
    const textMuted = normalizeToHex(json.color_text_muted || json.color_on_surface_variant) || "#6272a4";

    return {
        spec: 2,
        name,
        description,
        authors: [{ name: author }],
        background: bgUrl ? { url: bgUrl, alpha: 0.85 } : undefined,
        semanticColors: {
            BACKGROUND_PRIMARY: [bgPrimary, "#ffffff"],
            BACKGROUND_SECONDARY: [bgSecondary, "#f2f3f5"],
            BACKGROUND_SECONDARY_ALT: [bgSecondary, "#f2f3f5"],
            BACKGROUND_TERTIARY: [bgSecondary, "#e3e5e8"],
            BACKGROUND_FLOATING: [bgSecondary, "#ffffff"],
            BACKGROUND_MOBILE_PRIMARY: [bgPrimary, "#ffffff"],
            BACKGROUND_MOBILE_SECONDARY: [bgSecondary, "#f2f3f5"],
            TEXT_NORMAL: [textNormal, "#2e3338"],
            TEXT_MUTED: [textMuted, "#747f8d"],
            HEADER_PRIMARY: [textNormal, "#060607"],
            HEADER_SECONDARY: [textMuted, "#4f545c"],
            INTERACTIVE_NORMAL: [textMuted, "#4f545c"],
            INTERACTIVE_HOVER: [mainColor, "#2e3338"],
            INTERACTIVE_ACTIVE: [mainColor, "#060607"],
            BRAND_NEW_500: [mainColor, mainColor],
            BRAND_EXPERIMENT: [mainColor, mainColor]
        },
        rawColors: {
            BRAND_500: mainColor,
            PRIMARY_600: bgPrimary,
            PRIMARY_630: bgSecondary,
            PRIMARY_800: bgSecondary
        }
    };
}

export function parseThemeFromContent(content: string, sourceUrl: string): any {
    const trimmed = content.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
            const json = JSON.parse(trimmed);
            if (json.spec === 2 || json.spec === 3 || json.theme_color_map) {
                return json;
            }
            if (json.manifest || json.color_primary_dark || json.color_surface || json.background) {
                return convertAliucordTheme(json);
            }
            if (json.spec === undefined) {
                json.spec = 2;
                return json;
            }
            return json;
        } catch {
            // Not valid JSON, continue to CSS parsing
        }
    }

    return parseBetterDiscordCss(content, sourceUrl);
}
