export async function load({ fetch }) {
  const response = await fetch(`/json/index.json`);
  return await response.json();
}


