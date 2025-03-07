export async function load({ fetch }) {
  const response = await fetch(`/json/index.json`);
  const index = await response.json();

  return index;
}
