export function shortAddress(address: string, length = 4) {
  if (!address) return "";
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}