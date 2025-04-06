export default function isPrismaError(error: any): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}
