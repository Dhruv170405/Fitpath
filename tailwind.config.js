/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: '#F97316', // Orange-500
                secondary: '#3B82F6', // Blue-500
                background: '#09090B', // Zinc-950
                card: '#18181B', // Zinc-900
                text: '#FAFAFA', // Zinc-50
                muted: '#A1A1AA', // Zinc-400
                border: '#27272A', // Zinc-800
            }
        },
    },
    plugins: [],
}
