import type { PageServerLoad } from './$types';

const BASE_CAT = 'https://forum.qiime2.org/c/community-plugin-support'
const BASE_TAG = 'https://forum.qiime2.org/tag'


export const load: PageServerLoad = async ({ fetch, params }) => {
  let id = params.plugin;
  let alt = null;
  if (id.slice(0, 3) == "q2-") {
    alt = id.slice(3);
  }
  let urls = [
    `${BASE_CAT}/${id}.json`, `${BASE_CAT}/${alt}.json`,
    `${BASE_TAG}/${id}.json`, `${BASE_TAG}/${alt}.json`
  ]
  let hits: number[] = [];

  let results = (await Promise.allSettled(urls.map((url) => fetch(url))))
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((r, idx) => r.status === 200 && hits.push(idx) );

  let feeds = (await Promise.allSettled(results.map((r) => r.json())))
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);

  let users: Record<string, any> = {};
  for (const feed of feeds) {
    for (const user of feed.users) {
      let avatar = user.avatar_template
      if (!avatar.startsWith('//')) {
        avatar = 'https://forum.qiime2.org' + avatar;
      }
      avatar = avatar.replace('{size}', 24);
      user.avatar = avatar;
      users[user.id] = user;
    }
  }

  let topics = []
  let seen: Record<number, boolean> = {};
  for (const feed of feeds) {
    for (const topic of feed.topic_list.topics) {
      if (seen[topic.id]) continue;
      seen[topic.id] = true;
      topics.push(topic);
    }
  }

  topics.sort((a, b) =>
    (new Date(b.last_posted_at)).getTime() - (new Date(a.last_posted_at)).getTime()
  );
  topics.sort((a, b) => b.pinned - a.pinned);
  topics = topics.slice(0, 30);

  return {
    users,
    topics,
    hits: hits.map((idx) => urls[idx].slice(0, -('.json'.length)))
  };
};

