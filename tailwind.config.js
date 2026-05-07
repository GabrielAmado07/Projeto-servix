/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#E6F2FF',
                    100: '#CCE5FF',
                    200: '#99CCFF',
                    300: '#66B2FF',
                    400: '#3399FF',
                    500: '#0066CC',
                    600: '#0052A3',
                    700: '#003D7A',
                    800: '#002952',
                    900: '#001529',
                },
                accent: {
                    50: '#FFFBF0',
                    100: '#FFF7E0',
                    200: '#FFEFCC',
                    300: '#FFE5B3',
                    400: '#FFDB99',
                    500: '#FFB400',
                    600: '#E6A200',
                    700: '#CC8800',
                    800: '#B37000',
                    900: '#805200',
                },
                lightgray: {
                    50: '#FAFAFA',
                    100: '#F5F5F5',
                    200: '#EEEEEE',
                    300: '#E0E0E0',
                    400: '#D0D0D0',
                    500: '#B0B0B0',
                    600: '#909090',
                    700: '#707070',
                    800: '#505050',
                    900: '#303030',
                },
            },
        },
    },
    plugins: [],
}