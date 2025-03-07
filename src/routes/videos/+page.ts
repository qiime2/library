export async function load({ fetch }) {
  const response = await fetch(`/json/videos.json`);
  const videos = await response.json();

  return {
    videos,
  };
}
