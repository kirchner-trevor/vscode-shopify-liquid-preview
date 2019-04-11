export default {
    // usage: {{ 'abcde' | slice: 1, -1 }}
    slice: (str: string, start: number, end: number) => {
        return str.slice(start, end);
    },
}