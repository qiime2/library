export async function load({ fetch }) {
  const response = await fetch(`/json/books.json`);
  return await response.json();
}

