// Allow TypeScript to understand JSON imports
declare module '*.json' {
  const value: any;
  export default value;
}

// For dynamic imports
declare module '@/public/examples/*.json' {
  const value: any;
  export default value;
}
