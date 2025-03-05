export async function load({ fetch }) {
  const response = await fetch(`/json/workshops.json`);
  const workshops = await response.json();

  return {
    workshops,
  };
}

