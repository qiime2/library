export async function load({ fetch }) {
  const response = await fetch(`/json/plugins.json`);
  return await response.json();
}
