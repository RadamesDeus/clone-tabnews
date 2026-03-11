import { createRouter } from "next-connect";
import { onNoMatch, onError } from "infra/controller";
import user from "models/user.js";

const router = createRouter();

router.get(getHandlerUsers);

export default router.handler({
  onNoMatch,
  onError,
});

async function getHandlerUsers(request, response) {
  console.log("RADAMES request.body:", request.query?.username);
  const username = request.query?.username;

  const userItem = await user.findByUsername(username);
  return response.status(200).json(userItem);
}
