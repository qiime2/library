export async function load({ fetch }) {
  const response = await fetch(`/json/distros.json`);
  return await response.json();
}
