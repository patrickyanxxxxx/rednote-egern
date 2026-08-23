const RECOMMEND_TYPES = new Set([
  "recommend_user", "recommended_user", "user_recommend", "user_recommendation",
  "interest_user", "people_you_may_know", "suggested_user", "suggested_users"
]);

const RECOMMEND_KEYS = new Set([
  "recommend_users", "recommended_users", "user_recommendations", "interest_users",
  "people_you_may_know", "suggested_users", "may_interest_users"
]);

function isObject(value) {
  return value !== null && typeof value === "object";
}

function normalized(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isRecommendation(item) {
  if (!isObject(item)) return false;
  const types = [item.model_type, item.card_type, item.item_type, item.type, item.module_type];
  if (types.some(value => RECOMMEND_TYPES.has(normalized(value)))) return true;

  const reason = normalized(item.recommend_reason || item.recommend_type || item.source);
  if (/(^|[_-])(recommend|suggest|interest)([_-]|$)/.test(reason)) return true;

  const title = normalized(item.title || item.name || item.module_title || item.section_title);
  return title === "可能感兴趣的人" || title === "你可能感兴趣的人" ||
    title === "people you may know" || title === "suggested users" ||
    title === "people you might like";
}

function clean(node) {
  if (!isObject(node)) return;
  for (const key of Object.keys(node)) {
    if (RECOMMEND_KEYS.has(key)) {
      delete node[key];
      continue;
    }
    const value = node[key];
    if (Array.isArray(value)) {
      node[key] = value.filter(item => !isRecommendation(item));
      for (const item of node[key]) clean(item);
    } else if (isObject(value)) {
      if (isRecommendation(value)) {
        delete node[key];
      } else {
        clean(value);
      }
    }
  }
}

export default async function(ctx) {
  try {
    const data = await ctx.response.json();
    clean(data);
    return { body: data };
  } catch (_) {
    return;
  }
}
