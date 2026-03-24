import axios from "axios";

const FASTAPI = axios.create({
  baseURL: "http://localhost:8000",
});

/**
 * Fetch ML + Gemini combined job recommendations for a candidate.
 * @param {string} userId  - The candidate's user UUID
 * @param {number} topN    - Max recommendations to return (default 10)
 */
export const getRecommendations = async (userId, topN = 10) => {
  const res = await FASTAPI.get(`/user_profile/${userId}/recommendations`, {
    params: { top_n: topN },
  });
  return res.data;
};
