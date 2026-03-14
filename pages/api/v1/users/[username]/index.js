import { createRouter } from "next-connect";
import { onNoMatch, onError } from "infra/controller";
import user from "models/user.js";

const router = createRouter();

router.get(getHandlerUsers);
router.patch(patchHandlerUsers);

export default router.handler({
  onNoMatch,
  onError,
});

async function getHandlerUsers(request, response) {
  const username = request.query?.username;

  const userItem = await user.findByUsername(username);
  return response.status(200).json(userItem);
}

async function patchHandlerUsers(request, response) {
  const username = request.query?.username;
  const userInputValue = request.body;
  const userUpdated = await user.update(username, userInputValue);
  return response.status(200).json(userUpdated);
}
